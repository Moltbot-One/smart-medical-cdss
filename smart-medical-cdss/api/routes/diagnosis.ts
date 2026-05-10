import { Router, type Request, type Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../database.js'
import { suggestDiagnosis } from '../services/ai-engine.js'

const router = Router()

router.post('/suggest', (req: Request, res: Response): void => {
  try {
    const { patientId, symptoms, chiefComplaint, medicalHistory } = req.body

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      res.status(400).json({ code: 400, message: '请提供症状信息', data: null })
      return
    }

    let patientAllergies = ''
    let patientDiagnoses: any[] = []
    let encounterId: string | null = null

    if (patientId) {
      const patient = db.prepare('SELECT * FROM t_patient WHERE id = ?').get(patientId) as any
      if (patient) {
        patientAllergies = patient.allergies || ''
        patientDiagnoses = db.prepare(
          'SELECT icd10_code, icd10_name FROM t_diagnosis WHERE patient_id = ? AND is_confirmed = 1'
        ).all(patientId) as any[]

        const activeEncounter = db.prepare(
          "SELECT id FROM t_encounter WHERE patient_id = ? AND status = '进行中' ORDER BY created_at DESC LIMIT 1"
        ).get(patientId) as any
        if (activeEncounter) {
          encounterId = activeEncounter.id
        }
      }
    }

    const suggestions = suggestDiagnosis(symptoms, chiefComplaint || '', medicalHistory || '')

    const savedSuggestions = suggestions.map(s => {
      const id = uuidv4()
      const eid = encounterId || 'pending'
      const pid = patientId || 'pending'

      db.prepare(
        `INSERT INTO t_decision_suggestion (id, encounter_id, patient_id, suggestion_type, title, content, evidence, confidence, source, priority, is_accepted, created_at)
         VALUES (?, ?, ?, '诊断建议', ?, ?, ?, ?, ?, 2, 0, datetime('now'))`
      ).run(
        id, eid, pid,
        `${s.icd10_name}诊断建议`,
        s.description,
        s.evidence.join('; '),
        s.confidence,
        s.source,
      )

      return { id, ...s }
    })

    res.json({
      code: 200,
      message: 'AI诊断建议生成成功',
      data: {
        symptoms,
        chiefComplaint,
        suggestions: savedSuggestions,
        patientContext: patientId ? {
          allergies: patientAllergies,
          existingDiagnoses: patientDiagnoses,
        } : null,
        engineInfo: {
          llm: { status: 'active', description: '大语言模型推理引擎' },
          kg: { status: 'active', description: '医学知识图谱引擎' },
          rule: { status: 'active', description: '临床规则引擎' },
          hybrid: { status: 'active', description: '多引擎融合决策' },
        },
      },
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: 'AI诊断建议生成失败', data: null })
  }
})

router.post('/:suggestionId/accept', (req: Request, res: Response): void => {
  try {
    const { suggestionId } = req.params

    const suggestion = db.prepare(
      'SELECT * FROM t_decision_suggestion WHERE id = ?'
    ).get(suggestionId) as any

    if (!suggestion) {
      res.status(404).json({ code: 404, message: '建议不存在', data: null })
      return
    }

    db.prepare(
      'UPDATE t_decision_suggestion SET is_accepted = 1 WHERE id = ?'
    ).run(suggestionId)

    res.json({
      code: 200,
      message: '已采纳诊断建议',
      data: { id: suggestionId, is_accepted: true },
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '采纳建议失败', data: null })
  }
})

router.post('/:suggestionId/feedback', (req: Request, res: Response): void => {
  try {
    const { suggestionId } = req.params
    const { isHelpful, comment } = req.body

    const suggestion = db.prepare(
      'SELECT * FROM t_decision_suggestion WHERE id = ?'
    ).get(suggestionId) as any

    if (!suggestion) {
      res.status(404).json({ code: 404, message: '建议不存在', data: null })
      return
    }

    if (!isHelpful) {
      db.prepare(
        'UPDATE t_decision_suggestion SET is_accepted = 0 WHERE id = ?'
      ).run(suggestionId)
    }

    res.json({
      code: 200,
      message: '反馈已提交',
      data: {
        id: suggestionId,
        isHelpful,
        comment,
      },
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '提交反馈失败', data: null })
  }
})

export default router
