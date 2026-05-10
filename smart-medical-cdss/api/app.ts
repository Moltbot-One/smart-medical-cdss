import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import patientRoutes from './routes/patients.js'
import diagnosisRoutes from './routes/diagnosis.js'
import medicationRoutes from './routes/medication.js'
import labResultsRoutes from './routes/lab-results.js'
import knowledgeRoutes from './routes/knowledge.js'
import dashboardRoutes from './routes/dashboard.js'

import './database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use((req: Request, _res: Response, next: NextFunction): void => {
  const start = Date.now()
  const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

  ;(req as any).requestId = requestId

  _res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${_res.statusCode} ${duration}ms - ${requestId}`)
  })

  next()
})

app.use('/api/auth', authRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/diagnosis', diagnosisRoutes)
app.use('/api/medication', medicationRoutes)
app.use('/api/lab-results', labResultsRoutes)
app.use('/api/knowledge', knowledgeRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, _next: NextFunction): void => {
    res.status(200).json({
      code: 200,
      message: 'ok',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    })
  },
)

app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, error.message)
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    data: null,
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null,
  })
})

export default app
