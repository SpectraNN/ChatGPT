import express from 'express'
import cors from 'cors'
import router from './routes.js'
import monitorManager from './monitorManager.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use('/api', router)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: '服务器内部错误', detail: err.message })
})

app.listen(PORT, () => {
  console.log(`Minecraft monitoring backend is running on port ${PORT}`)
})

await monitorManager.initialize()
