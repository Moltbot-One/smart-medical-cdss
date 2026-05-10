import { Router, type Request, type Response } from 'express'
import db from '../database.js'
import { interpretLabResults } from '../services/ai-engine.js'

const router = Router()

router.get('/:encounterId', (req: Request, res: Response): void => {
  try {
    const { encounterId } = req.params

    const encounter = db.prepare('SELECT id FROM t_encounter WHERE id = ?').get(encounterId) as any
    if (!encounter) {
      res.status(404).json({ code: 404, message: '就诊记录不存在', data: null })
      return
    }

    const labResults = db.prepare(
      'SELECT * FROM t_lab_result WHERE encounter_id = ? ORDER BY test_time DESC'
    ).all(encounterId) as any[]

    res.json({
      code: 200,
      message: '获取检验结果成功',
      data: labResults,
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取检验结果失败', data: null })
  }
})

router.post('/interpret', (req: Request, res: Response): void => {
  try {
    const { encounterId, labResultIds } = req.body

    let labResults: any[] = []

    if (encounterId) {
      labResults = db.prepare(
        'SELECT * FROM t_lab_result WHERE encounter_id = ? ORDER BY test_time DESC'
      ).all(encounterId) as any[]
    } else if (labResultIds && Array.isArray(labResultIds)) {
      const placeholders = labResultIds.map(() => '?').join(',')
      labResults = db.prepare(
        `SELECT * FROM t_lab_result WHERE id IN (${placeholders})`
      ).all(...labResultIds) as any[]
    } else {
      res.status(400).json({ code: 400, message: '请提供就诊记录ID或检验结果ID', data: null })
      return
    }

    if (labResults.length === 0) {
      res.json({
        code: 200,
        message: '暂无检验结果需要解读',
        data: { interpretations: [], criticalAlerts: [] },
      })
      return
    }

    const interpretations = interpretLabResults(labResults)

    const criticalAlerts = interpretations.filter(i => i.is_critical)
    const abnormalCount = interpretations.filter(i => i.is_abnormal).length

    let overallAssessment = '检验结果基本正常'
    if (criticalAlerts.length > 0) {
      overallAssessment = `发现${criticalAlerts.length}项危急值，需紧急处理`
    } else if (abnormalCount > 0) {
      overallAssessment = `发现${abnormalCount}项异常指标，需关注`
    }

    res.json({
      code: 200,
      message: 'AI检验结果解读完成',
      data: {
        overallAssessment,
        interpretations,
        criticalAlerts: criticalAlerts.map(a => ({
          test_name: a.test_name,
          result_value: a.result_value,
          unit: a.unit,
          reference_range: a.reference_range,
          clinical_significance: a.clinical_significance,
          recommended_actions: a.recommended_actions,
        })),
        summary: {
          total: interpretations.length,
          normal: interpretations.filter(i => !i.is_abnormal).length,
          abnormal: abnormalCount,
          critical: criticalAlerts.length,
        },
      },
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: 'AI检验结果解读失败', data: null })
  }
})

export default router
