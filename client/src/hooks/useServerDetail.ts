import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import type { MetricSnapshot } from '../utils/api'
import { fetchInsights, fetchMetrics, subscribeToStream } from '../utils/api'

interface UseServerDetailOptions {
  serverId?: string
  range: string
}

export function useServerDetail ({ serverId, range }: UseServerDetailOptions) {
  const [metrics, setMetrics] = useState<MetricSnapshot[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [trends, setTrends] = useState<any[]>([])
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!serverId) {
      setMetrics([])
      setSummary(null)
      setTrends([])
      setInsights(null)
      return
    }

    const load = async () => {
      setLoading(true)
      const { metrics: metricList, summary: metricSummary, trends: metricTrends } = await fetchMetrics(serverId, range)
      setMetrics(metricList)
      setSummary(metricSummary)
      setTrends(metricTrends)
      const insightsData = await fetchInsights(serverId)
      setInsights(insightsData)
      setLoading(false)
    }
    load()
  }, [serverId, range])

  useEffect(() => {
    if (!serverId) return
    const unsubscribe = subscribeToStream(serverId, metric => {
      setMetrics(prev => [...prev.slice(-500), metric])
    })
    return unsubscribe
  }, [serverId])

  const chartData = useMemo(() => metrics.map(metric => ({
    timestamp: metric.timestamp,
    label: dayjs(metric.timestamp).format('MM-DD HH:mm'),
    players: metric.players?.online ?? 0,
    latency: metric.latency ?? 0,
    online: metric.online ? 1 : 0
  })), [metrics])

  return {
    metrics,
    summary,
    trends,
    insights,
    chartData,
    loading
  }
}
