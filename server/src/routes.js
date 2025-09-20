import express from 'express'
import { nanoid } from 'nanoid'
import { appendMetric, getMetrics, getServerById, getServers, removeServer, saveServer } from './database.js'
import monitorManager from './monitorManager.js'
import { buildInsights, computeDailyTrends, computeSummary } from './analytics.js'

const router = express.Router()

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

router.get('/servers', async (req, res) => {
  const servers = await getServers()
  const enriched = []
  for (const server of servers) {
    const metrics = await getMetrics(server.id)
    const summary = computeSummary(metrics)
    const latest = metrics[metrics.length - 1] ?? null
    enriched.push({
      ...server,
      summary,
      latest
    })
  }
  res.json(enriched)
})

router.post('/servers', async (req, res, next) => {
  try {
    const { name, address, port = 25565, intervalSeconds = 60, notes = '', tags = [] } = req.body
    if (!address) {
      return res.status(400).json({ message: '缺少服务器地址' })
    }

    const id = nanoid()
    const server = {
      id,
      name: name || address,
      address,
      port: Number(port) || 25565,
      intervalSeconds: Math.max(Number(intervalSeconds) || 60, 15),
      notes,
      tags,
      createdAt: new Date().toISOString()
    }

    await saveServer(server)
    monitorManager.startMonitor(server)

    res.status(201).json(server)
  } catch (error) {
    next(error)
  }
})

router.patch('/servers/:id', async (req, res, next) => {
  try {
    const server = await getServerById(req.params.id)
    if (!server) {
      return res.status(404).json({ message: '未找到服务器' })
    }

    const payload = { ...server, ...req.body }
    if (payload.intervalSeconds) {
      payload.intervalSeconds = Math.max(Number(payload.intervalSeconds) || server.intervalSeconds, 15)
    }

    await saveServer(payload)
    monitorManager.startMonitor(payload)

    res.json(payload)
  } catch (error) {
    next(error)
  }
})

router.delete('/servers/:id', async (req, res, next) => {
  try {
    await removeServer(req.params.id)
    monitorManager.stopMonitor(req.params.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

router.post('/servers/:id/refresh', async (req, res, next) => {
  try {
    const server = await getServerById(req.params.id)
    if (!server) {
      return res.status(404).json({ message: '未找到服务器' })
    }

    await monitorManager.refresh(server)
    const latest = await monitorManager.getLatestMetric(server.id)
    res.json(latest)
  } catch (error) {
    next(error)
  }
})

router.get('/servers/:id/metrics', async (req, res, next) => {
  try {
    const { range } = req.query
    const server = await getServerById(req.params.id)
    if (!server) {
      return res.status(404).json({ message: '未找到服务器' })
    }

    let metrics = await getMetrics(server.id)
    if (range) {
      const now = Date.now()
      let duration
      switch (range) {
        case '24h':
          duration = 24 * 60 * 60 * 1000
          break
        case '7d':
          duration = 7 * 24 * 60 * 60 * 1000
          break
        case '30d':
          duration = 30 * 24 * 60 * 60 * 1000
          break
        default:
          duration = null
      }

      if (duration) {
        metrics = metrics.filter(entry => now - new Date(entry.timestamp).getTime() <= duration)
      }
    }

    res.json({
      server,
      metrics,
      summary: computeSummary(metrics),
      trends: computeDailyTrends(metrics)
    })
  } catch (error) {
    next(error)
  }
})

router.get('/servers/:id/insights', async (req, res, next) => {
  try {
    const server = await getServerById(req.params.id)
    if (!server) {
      return res.status(404).json({ message: '未找到服务器' })
    }

    const metrics = await getMetrics(server.id)
    res.json(buildInsights(metrics))
  } catch (error) {
    next(error)
  }
})

router.get('/servers/:id/export', async (req, res, next) => {
  try {
    const server = await getServerById(req.params.id)
    if (!server) {
      return res.status(404).json({ message: '未找到服务器' })
    }

    const metrics = await getMetrics(server.id)
    const header = 'timestamp,online,latency,players_online,players_max,version,motd\n'
    const rows = metrics.map(entry => {
      const row = [
        entry.timestamp,
        entry.online,
        entry.latency ?? '',
        entry.players?.online ?? '',
        entry.players?.max ?? '',
        entry.version ?? '',
        entry.motd ? `"${String(entry.motd).replace(/"/g, '""')}"` : ''
      ]
      return row.join(',')
    })
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${server.address}-metrics.csv"`)
    res.send(header + rows.join('\n'))
  } catch (error) {
    next(error)
  }
})

router.get('/servers/:id/stream', async (req, res, next) => {
  try {
    const server = await getServerById(req.params.id)
    if (!server) {
      return res.status(404).json({ message: '未找到服务器' })
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    })

    const send = payload => {
      if (payload.serverId !== server.id) return
      res.write(`data: ${JSON.stringify(payload.metric)}\n\n`)
    }

    monitorManager.on('metric', send)

    req.on('close', () => {
      monitorManager.off('metric', send)
    })
  } catch (error) {
    next(error)
  }
})

export default router
