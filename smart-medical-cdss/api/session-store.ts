import { v4 as uuidv4 } from 'uuid'

interface Session {
  userId: string
  username: string
  name: string
  role: string
  department: string
  createdAt: Date
}

const sessions = new Map<string, Session>()

export function createSession(user: { id: string; username: string; name: string; role: string; department: string }): string {
  const token = uuidv4()
  sessions.set(token, {
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    department: user.department,
    createdAt: new Date(),
  })
  return token
}

export function getSession(token: string): Session | undefined {
  return sessions.get(token)
}

export function deleteSession(token: string): boolean {
  return sessions.delete(token)
}

export function authMiddleware(req: any, res: any, next: any): void {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ code: 401, message: '未登录或登录已过期', data: null })
    return
  }
  const token = authHeader.substring(7)
  const session = getSession(token)
  if (!session) {
    res.status(401).json({ code: 401, message: '登录已过期，请重新登录', data: null })
    return
  }
  req.user = session
  next()
}
