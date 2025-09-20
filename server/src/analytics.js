function computeSummary (metrics) {
  if (metrics.length === 0) {
    return {
      samples: 0,
      uptimeRatio: 0,
      averagePlayers: 0,
      peakPlayers: 0,
      lowestPlayers: 0,
      averageLatency: 0,
      firstSeen: null,
      lastSeen: null
    }
  }

  const onlineMetrics = metrics.filter(entry => entry.online)
  const playerCounts = metrics.map(entry => entry.players?.online ?? 0)
  const latencies = metrics.filter(entry => typeof entry.latency === 'number').map(entry => entry.latency)

  const totalSamples = metrics.length
  const uptimeRatio = onlineMetrics.length / totalSamples
  const averagePlayers = playerCounts.reduce((acc, value) => acc + value, 0) / totalSamples
  const peakPlayers = Math.max(...playerCounts)
  const lowestPlayers = Math.min(...playerCounts)
  const averageLatency = latencies.length > 0 ? latencies.reduce((acc, value) => acc + value, 0) / latencies.length : null
  const firstSeen = metrics[0]?.timestamp ?? null
  const lastSeen = metrics[metrics.length - 1]?.timestamp ?? null

  return {
    samples: totalSamples,
    uptimeRatio,
    averagePlayers,
    peakPlayers,
    lowestPlayers,
    averageLatency,
    firstSeen,
    lastSeen
  }
}

function computeDailyTrends (metrics) {
  const bucket = new Map()

  for (const metric of metrics) {
    const day = new Date(metric.timestamp)
    const key = `${day.getUTCFullYear()}-${String(day.getUTCMonth() + 1).padStart(2, '0')}-${String(day.getUTCDate()).padStart(2, '0')}`
    if (!bucket.has(key)) {
      bucket.set(key, [])
    }
    bucket.get(key).push(metric)
  }

  return Array.from(bucket.entries()).map(([date, items]) => ({
    date,
    summary: computeSummary(items)
  }))
}

function buildInsights (metrics) {
  const summary = computeSummary(metrics)
  const uptimePercent = Math.round(summary.uptimeRatio * 1000) / 10
  const recommendations = []

  if (summary.uptimeRatio < 0.9) {
    recommendations.push('服务器在线率不足 90%，建议检查服务器的稳定性或主机资源配置。')
  } else {
    recommendations.push('服务器在线率非常稳定，建议继续保持当前运维策略。')
  }

  if (summary.peakPlayers > 0 && summary.peakPlayers === summary.lowestPlayers) {
    recommendations.push('玩家在线峰值与低谷差异不大，可考虑举办活动吸引更多玩家加入。')
  }

  if (summary.averageLatency != null && summary.averageLatency > 150) {
    recommendations.push('平均延迟偏高，建议优化网络线路或更换更近地区的服务器。')
  } else if (summary.averageLatency != null) {
    recommendations.push('网络延迟表现良好，可在峰值时段进行更多玩法推广。')
  }

  const stablePeriods = extractStablePeriods(metrics)

  return {
    summary,
    uptimePercent,
    recommendations,
    stablePeriods
  }
}

function extractStablePeriods (metrics) {
  if (metrics.length === 0) return []
  const segments = []
  let current = null

  for (const entry of metrics) {
    if (!entry.online) {
      if (current) {
        current.end = entry.timestamp
        current.durationMinutes = Math.round((new Date(current.end) - new Date(current.start)) / 60000)
        segments.push(current)
        current = null
      }
      continue
    }

    if (!current) {
      current = {
        start: entry.timestamp,
        end: entry.timestamp,
        averagePlayers: entry.players?.online ?? 0,
        peakPlayers: entry.players?.online ?? 0,
        samples: 1
      }
    } else {
      current.end = entry.timestamp
      current.samples += 1
      current.averagePlayers = ((current.averagePlayers * (current.samples - 1)) + (entry.players?.online ?? 0)) / current.samples
      current.peakPlayers = Math.max(current.peakPlayers, entry.players?.online ?? 0)
    }
  }

  if (current) {
    current.durationMinutes = Math.round((new Date(current.end) - new Date(current.start)) / 60000)
    segments.push(current)
  }

  return segments
}

export {
  computeSummary,
  computeDailyTrends,
  buildInsights
}
