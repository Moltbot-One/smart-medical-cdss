import { Router, type Request, type Response } from 'express'
import db from '../database.js'
import { checkMedications, checkDrugInteraction } from '../services/ai-engine.js'

const router = Router()

router.post('/check', (req: Request, res: Response): void => {
  try {
    const { patientId, medications } = req.body

    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      res.status(400).json({ code: 400, message: '请提供药品信息', data: null })
      return
    }

    let patientAllergies = ''
    let patientDiagnoses: Array<{ icd10_code: string; icd10_name: string }> = []

    if (patientId) {
      const patient = db.prepare('SELECT * FROM t_patient WHERE id = ?').get(patientId) as any
      if (patient) {
        patientAllergies = patient.allergies || ''
        patientDiagnoses = db.prepare(
          'SELECT icd10_code, icd10_name FROM t_diagnosis WHERE patient_id = ? AND is_confirmed = 1'
        ).all(patientId) as any[]
      }
    }

    const warnings = checkMedications(patientId, medications, patientAllergies, patientDiagnoses)

    const levelCounts = {
      '禁忌': warnings.filter(w => w.level === '禁忌').length,
      '严重': warnings.filter(w => w.level === '严重').length,
      '警告': warnings.filter(w => w.level === '警告').length,
      '注意': warnings.filter(w => w.level === '注意').length,
    }

    let overallLevel = '安全'
    if (levelCounts['禁忌'] > 0) overallLevel = '存在禁忌'
    else if (levelCounts['严重'] > 0) overallLevel = '存在严重风险'
    else if (levelCounts['警告'] > 0) overallLevel = '存在风险提示'
    else if (levelCounts['注意'] > 0) overallLevel = '需要关注'

    res.json({
      code: 200,
      message: '用药安全检查完成',
      data: {
        overallLevel,
        warnings,
        summary: levelCounts,
        checkedMedications: medications.map((m: any) => m.drugName),
        patientContext: patientId ? {
          allergies: patientAllergies,
          diagnoses: patientDiagnoses,
        } : null,
      },
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '用药安全检查失败', data: null })
  }
})

router.get('/interactions', (req: Request, res: Response): void => {
  try {
    const drug1 = req.query.drug1 as string
    const drug2 = req.query.drug2 as string

    if (!drug1 || !drug2) {
      res.status(400).json({ code: 400, message: '请提供两个药品名称', data: null })
      return
    }

    const interaction = checkDrugInteraction(drug1, drug2)

    res.json({
      code: 200,
      message: interaction ? '发现药物相互作用' : '未发现药物相互作用',
      data: interaction || {
        level: '安全',
        type: '药物相互作用',
        message: `${drug1}与${drug2}之间未发现已知相互作用`,
        drugs: [drug1, drug2],
      },
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '药物相互作用检查失败', data: null })
  }
})

export default router
