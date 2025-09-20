import React, { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import dayjs from 'dayjs'
import type { MetricSnapshot } from '../utils/api'
import './MetricsDashboard.css'

interface Props {
  serverName: string
  data: Array<{
    timestamp: string
    label: string
    players: number
    latency: number
    online: number
  }>
  summary: any
  insights: any
  trends: Array<{ date: string; summary: any }>
}

const ranges = [
  { label: '最近 24 小时', value: '24h' },
  { label: '最近 7 天', value: '7d' },
  { label: '最近 30 天', value: '30d' }
]

const MetricsDashboard: React.FC<Props & { onRangeChange: (range: string) => void; activeRange: string; onExport: () => void; onRefresh: () => Promise<void>; latest?: MetricSnapshot | null }> = ({
  serverName,
  data,
  summary,
  insights,
  trends,
  activeRange,
  onRangeChange,
  onExport,
  onRefresh,
  latest
}) => {
  const [refreshing, setRefreshing] = useState(false)

  const heatmap = useMemo(() => trends.flatMap(item => ({
    date: item.date,
    players: Math.round(item.summary.averagePlayers || 0),
    uptime: Math.round((item.summary.uptimeRatio || 0) * 100)
  })), [trends])

  const handleRefresh = async () => {
    setRefreshing(true)
    await onRefresh()
    setRefreshing(false)
  }

  return (
    <section id="analytics" className="metrics-dashboard">
      <header>
        <div>
          <h2>{serverName} · 运行表现概览</h2>
          <p>最近一次采样于 {latest ? dayjs(latest.timestamp).format('YYYY-MM-DD HH:mm:ss') : '暂无数据'}</p>
        </div>
        <div className="metrics-dashboard__actions">
          <button onClick={handleRefresh} disabled={refreshing}>{refreshing ? '刷新中...' : '立即刷新'}</button>
          <button onClick={onExport}>导出 CSV</button>
        </div>
      </header>

      <div className="metrics-dashboard__summary">
        <div>
          <span>采样总数</span>
          <strong>{summary?.samples ?? 0}</strong>
        </div>
        <div>
          <span>平均在线</span>
          <strong>{summary ? summary.averagePlayers.toFixed(1) : '0.0'}</strong>
        </div>
        <div>
          <span>在线率</span>
          <strong>{summary ? `${Math.round(summary.uptimeRatio * 1000) / 10}%` : '0%'}</strong>
        </div>
        <div>
          <span>峰值在线</span>
          <strong>{summary?.peakPlayers ?? 0}</strong>
        </div>
        <div>
          <span>最低在线</span>
          <strong>{summary?.lowestPlayers ?? 0}</strong>
        </div>
        <div>
          <span>平均延迟</span>
          <strong>{summary?.averageLatency ? `${summary.averageLatency.toFixed(0)}ms` : '—'}</strong>
        </div>
      </div>

      <div className="metrics-dashboard__filters">
        {ranges.map(range => (
          <button
            key={range.value}
            className={range.value === activeRange ? 'active' : ''}
            onClick={() => onRangeChange(range.value)}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div className="metrics-dashboard__chart">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPlayers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" minTickGap={30} tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} allowDecimals={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" yAxisId="left" dataKey="players" name="在线人数" stroke="#6366f1" fill="url(#colorPlayers)" />
            <Line type="monotone" yAxisId="right" dataKey="latency" name="延迟 (ms)" stroke="#22d3ee" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="metrics-dashboard__two-cols">
        <div className="metrics-dashboard__card">
          <h3>智能洞察</h3>
          <ul>
            {(insights?.recommendations ?? []).map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="metrics-dashboard__stable">
            <h4>稳定运行时段</h4>
            {(insights?.stablePeriods ?? []).slice(0, 5).map((item: any, index: number) => (
              <div key={`${item.start}-${index}`}>
                <span>{dayjs(item.start).format('MM-DD HH:mm')} ~ {dayjs(item.end).format('MM-DD HH:mm')}</span>
                <span>平均在线 {item.averagePlayers.toFixed(1)} · 峰值 {item.peakPlayers}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="metrics-dashboard__card">
          <h3>日度趋势对比</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={heatmap}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" dataKey="players" orientation="left" allowDecimals={false} />
              <YAxis yAxisId="right" dataKey="uptime" orientation="right" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="players" name="平均在线" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" yAxisId="right" dataKey="uptime" name="在线率%" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}

export default MetricsDashboard
