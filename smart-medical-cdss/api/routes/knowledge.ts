import { Router, type Request, type Response } from 'express'
import db from '../database.js'

const router = Router()

router.get('/search', (req: Request, res: Response): void => {
  try {
    const query = (req.query.query as string) || ''
    const type = (req.query.type as string) || ''
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 10

    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (query) {
      whereClause += ' AND (title LIKE ? OR content LIKE ? OR keywords LIKE ? OR icd10_codes LIKE ?)'
      params.push(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`)
    }

    if (type) {
      whereClause += ' AND knowledge_type = ?'
      params.push(type)
    }

    const countResult = db.prepare(
      `SELECT COUNT(*) as total FROM t_knowledge ${whereClause}`
    ).get(...params) as { total: number }

    const offset = (page - 1) * pageSize
    const items = db.prepare(
      `SELECT * FROM t_knowledge ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, pageSize, offset) as any[]

    res.json({
      code: 200,
      message: '搜索知识库成功',
      data: {
        list: items,
        total: countResult.total,
        page,
        pageSize,
        totalPages: Math.ceil(countResult.total / pageSize),
      },
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '搜索知识库失败', data: null })
  }
})

router.get('/types', (_req: Request, res: Response): void => {
  try {
    const types = db.prepare(
      'SELECT knowledge_type, COUNT(*) as count FROM t_knowledge GROUP BY knowledge_type'
    ).all() as any[]

    res.json({
      code: 200,
      message: '获取知识类型列表成功',
      data: types,
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取知识类型列表失败', data: null })
  }
})

router.get('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params

    const knowledge = db.prepare('SELECT * FROM t_knowledge WHERE id = ?').get(id) as any
    if (!knowledge) {
      res.status(404).json({ code: 404, message: '知识条目不存在', data: null })
      return
    }

    let relatedItems: any[] = []
    if (knowledge.icd10_codes) {
      const codes = knowledge.icd10_codes.split(',').map(c => c.trim())
      if (codes.length > 0 && codes[0]) {
        const placeholders = codes.map(() => 'icd10_codes LIKE ?').join(' OR ')
        const likeParams = codes.map(c => `%${c}%`)
        relatedItems = db.prepare(
          `SELECT id, title, knowledge_type, evidence_level FROM t_knowledge WHERE id != ? AND (${placeholders}) LIMIT 5`
        ).all(id, ...likeParams) as any[]
      }
    }

    res.json({
      code: 200,
      message: '获取知识详情成功',
      data: {
        ...knowledge,
        relatedItems,
      },
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取知识详情失败', data: null })
  }
})

export default router
