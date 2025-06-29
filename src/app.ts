import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import { sequelize } from './config'
import router from './routes'
import { errorHandler } from './middlewares'

dotenv.config()
const PORT = process.env.PORT || 3000
const app = express()
app.use(express.json())

app.use(router)
app.use(errorHandler)

sequelize.sync().then(() => {
  console.log('Database synced')
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch((err) => {
  console.error('Failed to connect to database:', err)
})