import { Router, type Request, type Response } from 'express'
import db from '../database.js'
import { createSession, deleteSession, getSession } from '../session-store.js'

const router = Router()

router.post('/login', (req: Request, res: Response): void => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      res.status(400).json({ code: 400, message: '用户名和密码不能为空', data: null })
      return
    }

    const user = db.prepare(
      'SELECT id, username, password_hash, name, role, department FROM t_user WHERE username = ? AND status = ?'
    ).get(username, 'active') as any

    if (!user || user.password_hash !== password) {
      res.status(401).json({ code: 401, message: '用户名或密码错误', data: null })
      return
    }

    const token = createSession({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department,
    })

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          department: user.department,
        },
      },
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '登录失败', data: null })
  }
})

router.post('/logout', (req: Request, res: Response): void => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      deleteSession(token)
    }
    res.json({ code: 200, message: '登出成功', data: null })
  } catch (error) {
    res.status(500).json({ code: 500, message: '登出失败', data: null })
  }
})

router.get('/me', (req: Request, res: Response): void => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ code: 401, message: '未登录', data: null })
      return
    }

    const token = authHeader.substring(7)
    const session = getSession(token)
    if (!session) {
      res.status(401).json({ code: 401, message: '登录已过期', data: null })
      return
    }

    const user = db.prepare(
      'SELECT id, username, name, role, department, phone, email, status FROM t_user WHERE id = ?'
    ).get(session.userId) as any

    if (!user) {
      res.status(404).json({ code: 404, message: '用户不存在', data: null })
      return
    }

    res.json({ code: 200, message: '获取用户信息成功', data: user })
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取用户信息失败', data: null })
  }
})

export default router
