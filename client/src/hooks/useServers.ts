import { useEffect, useState } from 'react'
import type { MetricSnapshot, ServerPayload } from '../utils/api'
import { fetchServers, subscribeToStream } from '../utils/api'

export function useServers () {
  const [servers, setServers] = useState<ServerPayload[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await fetchServers()
        setServers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const unsubscribeList: Array<() => void> = []
    for (const server of servers) {
      const unsubscribe = subscribeToStream(server.id, (metric: MetricSnapshot) => {
        setServers(prev => prev.map(item => {
          if (item.id !== server.id) return item
          return {
            ...item,
            latest: metric,
            summary: item.summary
          }
        }))
      })
      unsubscribeList.push(unsubscribe)
    }
    return () => {
      unsubscribeList.forEach(fn => fn())
    }
  }, [servers.map(server => server.id).join(',')])

  return { servers, setServers, loading, error }
}
