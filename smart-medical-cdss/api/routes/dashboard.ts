import { Router, type Request, type Response } from 'express'
import db from '../database.js'

const router = Router()

router.get('/stats', (_req: Request, res: Response): void => {
  try {
    const today = new Date().toISOString().split('T')[0]

    const todayEncounters = (db.prepare(
      "SELECT COUNT(*) as count FROM t_encounter WHERE date(admission_time) = ?"
    ).get(today) as any).count

    const pendingReviews = (db.prepare(
      "SELECT COUNT(*) as count FROM t_encounter WHERE status = '进行中'"
    ).get() as any).count

    const criticalAlerts = (db.prepare(
      'SELECT COUNT(*) as count FROM t_lab_result WHERE is_critical = 1 AND date(created_at) >= date(?, \'-7 days\')'
    ).get(today) as any).count

    const aiAssistCount = (db.prepare(
      'SELECT COUNT(*) as count FROM t_decision_suggestion WHERE date(created_at) >= date(?, \'-7 days\')'
    ).get(today) as any).count

    const totalPatients = (db.prepare('SELECT COUNT(*) as count FROM t_patient').get() as any).count
    const totalEncounters = (db.prepare('SELECT COUNT(*) as count FROM t_encounter').get() as any).count
    const totalDiagnoses = (db.prepare('SELECT COUNT(*) as count FROM t_diagnosis WHERE is_confirmed = 1').get() as any).count

    const departmentStats = db.prepare(
      'SELECT department_id, COUNT(*) as count FROM t_encounter GROUP BY department_id ORDER BY count DESC LIMIT 10'
    ).all() as any[]

    res.json({
      code: 200,
      message: '获取统计数据成功',
      data: {
        todayEncounters,
        pendingReviews,
        criticalAlerts,
        aiAssistCount,
        overview: {
          totalPatients,
          totalEncounters,
          totalDiagnoses,
        },
        departmentStats,
      },
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取统计数据失败', data: null })
  }
})

router.get('/alerts', (req: Request, res: Response): void => {
  try {
    const limit = parseInt(req.query.limit as string) || 10

    const criticalLabs = db.prepare(
      `SELECT lr.*, p.name as patient_name, e.visit_no, e.department_id
       FROM t_lab_result lr
       LEFT JOIN t_patient p ON lr.patient_id = p.id
       LEFT JOIN t_encounter e ON lr.encounter_id = e.id
       WHERE lr.is_critical = 1
       ORDER BY lr.created_at DESC
       LIMIT ?`
    ).all(limit) as any[]

    const highPrioritySuggestions = db.prepare(
      `SELECT ds.*, p.name as patient_name, e.visit_no, e.department_id
       FROM t_decision_suggestion ds
       LEFT JOIN t_patient p ON ds.patient_id = p.id
       LEFT JOIN t_encounter e ON ds.encounter_id = e.id
       WHERE ds.priority >= 3
       ORDER BY ds.created_at DESC
       LIMIT ?`
    ).all(limit) as any[]

    const alerts = [
      ...criticalLabs.map(lab => ({
        id: lab.id,
        type: '危急值',
        level: 'critical',
        title: `${lab.test_name}危急值`,
        message: `患者${lab.patient_name}(${lab.visit_no}) ${lab.test_name}: ${lab.result_value} ${lab.unit}`,
        department: lab.department_id,
        time: lab.created_at,
      })),
      ...highPrioritySuggestions.map(s => ({
        id: s.id,
        type: s.suggestion_type,
        level: 'warning',
        title: s.title,
        message: `患者${s.patient_name}(${s.visit_no}) ${s.content?.substring(0, 80)}...`,
        department: s.source,
        time: s.created_at,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, limit)

    res.json({
      code: 200,
      message: '获取预警信息成功',
      data: alerts,
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取预警信息失败', data: null })
  }
})

router.get('/recent-encounters', (req: Request, res: Response): void => {
  try {
    const limit = parseInt(req.query.limit as string) || 10

    const encounters = db.prepare(
      `SELECT e.*, p.name as patient_name, p.gender, p.medical_record_no,
              d.icd10_name as primary_diagnosis
       FROM t_encounter e
       LEFT JOIN t_patient p ON e.patient_id = p.id
       LEFT JOIN t_diagnosis d ON e.id = d.encounter_id AND d.diagnosis_type = '主诊断'
       ORDER BY e.created_at DESC
       LIMIT ?`
    ).all(limit) as any[]

    res.json({
      code: 200,
      message: '获取最近就诊记录成功',
      data: encounters,
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取最近就诊记录失败', data: null })
  }
})

export default router
