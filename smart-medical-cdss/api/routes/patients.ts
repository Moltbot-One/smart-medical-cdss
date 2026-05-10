import { Router, type Request, type Response } from 'express'
import db from '../database.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 10
    const search = (req.query.search as string) || ''
    const department = (req.query.department as string) || ''

    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.medical_record_no LIKE ? OR p.phone LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (department) {
      whereClause += ' AND e.department_id = ?'
      params.push(department)
    }

    const countResult = db.prepare(
      `SELECT COUNT(DISTINCT p.id) as total FROM t_patient p LEFT JOIN t_encounter e ON p.id = e.patient_id ${whereClause}`
    ).get(...params) as { total: number }

    const offset = (page - 1) * pageSize
    const patients = db.prepare(
      `SELECT DISTINCT p.* FROM t_patient p LEFT JOIN t_encounter e ON p.id = e.patient_id ${whereClause} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, pageSize, offset) as any[]

    res.json({
      code: 200,
      message: '获取患者列表成功',
      data: {
        list: patients,
        total: countResult.total,
        page,
        pageSize,
        totalPages: Math.ceil(countResult.total / pageSize),
      },
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取患者列表失败', data: null })
  }
})

router.get('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params

    const patient = db.prepare('SELECT * FROM t_patient WHERE id = ?').get(id) as any
    if (!patient) {
      res.status(404).json({ code: 404, message: '患者不存在', data: null })
      return
    }

    const encounters = db.prepare(
      'SELECT * FROM t_encounter WHERE patient_id = ? ORDER BY admission_time DESC'
    ).all(id) as any[]

    const diagnoses = db.prepare(
      'SELECT * FROM t_diagnosis WHERE patient_id = ? ORDER BY created_at DESC'
    ).all(id) as any[]

    const medications = db.prepare(
      'SELECT * FROM t_medication WHERE patient_id = ? ORDER BY created_at DESC'
    ).all(id) as any[]

    const labResults = db.prepare(
      'SELECT * FROM t_lab_result WHERE patient_id = ? ORDER BY test_time DESC'
    ).all(id) as any[]

    res.json({
      code: 200,
      message: '获取患者详情成功',
      data: {
        ...patient,
        encounters,
        diagnoses,
        medications,
        labResults,
      },
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取患者详情失败', data: null })
  }
})

router.get('/:id/encounters', (req: Request, res: Response): void => {
  try {
    const { id } = req.params
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 10

    const patient = db.prepare('SELECT id FROM t_patient WHERE id = ?').get(id) as any
    if (!patient) {
      res.status(404).json({ code: 404, message: '患者不存在', data: null })
      return
    }

    const countResult = db.prepare(
      'SELECT COUNT(*) as total FROM t_encounter WHERE patient_id = ?'
    ).get(id) as { total: number }

    const offset = (page - 1) * pageSize
    const encounters = db.prepare(
      'SELECT * FROM t_encounter WHERE patient_id = ? ORDER BY admission_time DESC LIMIT ? OFFSET ?'
    ).all(id, pageSize, offset) as any[]

    res.json({
      code: 200,
      message: '获取就诊记录成功',
      data: {
        list: encounters,
        total: countResult.total,
        page,
        pageSize,
        totalPages: Math.ceil(countResult.total / pageSize),
      },
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取就诊记录失败', data: null })
  }
})

router.get('/:id/medications', (req: Request, res: Response): void => {
  try {
    const { id } = req.params

    const patient = db.prepare('SELECT id FROM t_patient WHERE id = ?').get(id) as any
    if (!patient) {
      res.status(404).json({ code: 404, message: '患者不存在', data: null })
      return
    }

    const medications = db.prepare(
      `SELECT m.*, e.visit_no, e.department_id, e.encounter_type
       FROM t_medication m
       LEFT JOIN t_encounter e ON m.encounter_id = e.id
       WHERE m.patient_id = ?
       ORDER BY m.created_at DESC`
    ).all(id) as any[]

    res.json({
      code: 200,
      message: '获取用药记录成功',
      data: medications,
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取用药记录失败', data: null })
  }
})

export default router
