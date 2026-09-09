import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import portfolioRoutes from './routes/portfolio'

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/portfolio', portfolioRoutes)

const port = Number(process.env.PORT) || 5000
const dbLink = process.env.DB_LINK

if (!dbLink) {
  console.error('DB_LINK is missing in .env')
  process.exit(1)
}

mongoose
  .connect(dbLink)
  .then(() => {
    console.log('Connected to database')
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error('Could not connect to database', err)
    process.exit(1)
  })
