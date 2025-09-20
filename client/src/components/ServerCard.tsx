import React from 'react'
import dayjs from 'dayjs'
import type { ServerPayload } from '../utils/api'
import './ServerCard.css'

interface Props {
  server: ServerPayload
  onSelect: (server: ServerPayload) => void
  onDelete: (server: ServerPayload) => void
}

const ServerCard: React.FC<Props> = ({ server, onSelect, onDelete }) => {
  const latest = server.latest
  const summary = server.summary

  return (
    <div className="server-card" onClick={() => onSelect(server)}>
      <div className="server-card__header">
        <div>
          <h3>{server.name}</h3>
          <p>{server.address}:{server.port}</p>
        </div>
        <div className={`server-card__status ${latest?.online ? 'online' : 'offline'}`}>
          {latest?.online ? '在线' : '离线'}
        </div>
      </div>
      <div className="server-card__metrics">
        <div>
          <span className="label">最新在线人数</span>
          <strong>{latest?.players?.online ?? 0}</strong>
        </div>
        <div>
          <span className="label">在线率</span>
          <strong>{summary ? Math.round(summary.uptimeRatio * 1000) / 10 : 0}%</strong>
        </div>
        <div>
          <span className="label">峰值</span>
          <strong>{summary?.peakPlayers ?? 0}</strong>
        </div>
        <div>
          <span className="label">平均延迟</span>
          <strong>{summary?.averageLatency ? `${Math.round(summary.averageLatency)}ms` : '—'}</strong>
        </div>
      </div>
      <div className="server-card__footer">
        <div className="server-card__tags">
          {(server.tags ?? []).map(tag => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="server-card__meta">
          <span>监控频率：{server.intervalSeconds}s</span>
          <span>创建于 {dayjs(server.createdAt).format('YYYY-MM-DD HH:mm')}</span>
        </div>
      </div>
      <button
        className="server-card__delete"
        onClick={event => {
          event.stopPropagation()
          onDelete(server)
        }}
      >
        删除
      </button>
    </div>
  )
}

export default ServerCard
