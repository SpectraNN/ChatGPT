import { promises as fs } from 'fs'
import path from 'path'

const DB_PATH = path.resolve(process.cwd(), '../data/monitoring.json')

async function ensureDatabase () {
  try {
    await fs.access(DB_PATH)
  } catch {
    const initial = { servers: [], metrics: {} }
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true })
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8')
  }
}

async function readDatabase () {
  await ensureDatabase()
  const raw = await fs.readFile(DB_PATH, 'utf-8')
  return JSON.parse(raw)
}

async function writeDatabase (data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export async function getServers () {
  const db = await readDatabase()
  return db.servers
}

export async function getServerById (id) {
  const db = await readDatabase()
  return db.servers.find(server => server.id === id) || null
}

export async function saveServer (server) {
  const db = await readDatabase()
  const existingIndex = db.servers.findIndex(item => item.id === server.id)
  if (existingIndex >= 0) {
    db.servers[existingIndex] = server
  } else {
    db.servers.push(server)
  }
  await writeDatabase(db)
}

export async function removeServer (id) {
  const db = await readDatabase()
  db.servers = db.servers.filter(server => server.id !== id)
  delete db.metrics[id]
  await writeDatabase(db)
}

export async function appendMetric (serverId, metric) {
  const db = await readDatabase()
  if (!Array.isArray(db.metrics[serverId])) {
    db.metrics[serverId] = []
  }
  db.metrics[serverId].push(metric)
  await writeDatabase(db)
}

export async function getMetrics (serverId) {
  const db = await readDatabase()
  return db.metrics[serverId] || []
}

export async function replaceMetrics (serverId, metrics) {
  const db = await readDatabase()
  db.metrics[serverId] = metrics
  await writeDatabase(db)
}

export async function exportDatabase () {
  const db = await readDatabase()
  return db
}
