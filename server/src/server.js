import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { connectDb } from './config/db.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import blogRoutes from './routes/blogs.js'
import eventRoutes from './routes/events.js'
import knowledgeRoutes from './routes/knowledge.js'
import { notFound, errorHandler } from './middleware/error.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.json({ message: 'Software Club API' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/blogs', blogRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/knowledge', knowledgeRoutes)

app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 5050

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
  })
  .catch((error) => {
    console.error('DB connection failed', error)
    process.exit(1)
  })
