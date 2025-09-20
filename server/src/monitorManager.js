import EventEmitter from 'events'
import { status } from 'minecraft-server-util'
import { appendMetric, getMetrics, getServers, saveServer } from './database.js'

const DEFAULT_INTERVAL = 60

class MonitorManager extends EventEmitter {
  constructor () {
    super()
    this.monitors = new Map()
  }

  async initialize () {
    const servers = await getServers()
    for (const server of servers) {
      this.startMonitor(server)
    }
  }

  startMonitor (server) {
    const intervalSeconds = Math.max(server.intervalSeconds ?? DEFAULT_INTERVAL, 15)
    this.stopMonitor(server.id)

    const tick = async () => {
      const timestamp = new Date().toISOString()
      let snapshot
      try {
        const response = await status(server.address, {
          port: server.port,
          enableSRV: true,
          timeout: 8000
        })

        snapshot = {
          timestamp,
          online: true,
          latency: response.roundTripLatency,
          version: response.version?.name ?? '未知',
          motd: Array.isArray(response.motd?.clean) ? response.motd.clean.join(' ') : response.motd?.clean ?? '',
          players: {
            max: response.players?.max ?? 0,
            online: response.players?.online ?? 0,
            sample: response.players?.sample?.map(player => ({ id: player.id, name: player.name })) ?? []
          }
        }
      } catch (error) {
        snapshot = {
          timestamp,
          online: false,
          error: error.message
        }
      }

      await appendMetric(server.id, snapshot)
      this.emit('metric', { serverId: server.id, metric: snapshot })
    }

    const timer = setInterval(tick, intervalSeconds * 1000)
    timer.unref?.()
    this.monitors.set(server.id, { timer, tick })
    tick()
  }

  stopMonitor (serverId) {
    const record = this.monitors.get(serverId)
    if (record) {
      clearInterval(record.timer)
      this.monitors.delete(serverId)
    }
  }

  async refresh (server) {
    const record = this.monitors.get(server.id)
    if (record) {
      await record.tick()
    } else {
      this.startMonitor(server)
    }
  }

  async updateServer (server) {
    await saveServer(server)
    this.startMonitor(server)
  }

  async getLatestMetric (serverId) {
    const metrics = await getMetrics(serverId)
    return metrics[metrics.length - 1] ?? null
  }
}

const monitorManager = new MonitorManager()

export default monitorManager
