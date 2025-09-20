import React, { useMemo, useState } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import FeatureGrid from '../components/FeatureGrid'
import ServerForm from '../components/ServerForm'
import ServerCard from '../components/ServerCard'
import MetricsDashboard from '../components/MetricsDashboard'
import { useServers } from '../hooks/useServers'
import { useServerDetail } from '../hooks/useServerDetail'
import { createServer, deleteServer, openExport, triggerRefresh, type MetricSnapshot, type ServerPayload } from '../utils/api'
import './App.css'

const App: React.FC = () => {
  const { servers, setServers, loading, error } = useServers()
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [range, setRange] = useState('24h')

  const selectedServer = useMemo<ServerPayload | undefined>(() => servers.find(server => server.id === selectedId) ?? servers[0], [servers, selectedId])
  const { chartData, summary, insights, trends, loading: detailLoading } = useServerDetail({ serverId: selectedServer?.id, range })

  const handleCreate = async (payload: any) => {
    const server = await createServer(payload)
    setServers(prev => [...prev, server])
    setSelectedId(server.id)
  }

  const handleDelete = async (server: ServerPayload) => {
    if (!window.confirm(`确认删除监控节点 ${server.name}?`)) return
    await deleteServer(server.id)
    setServers(prev => prev.filter(item => item.id !== server.id))
    if (selectedId === server.id) {
      setSelectedId(undefined)
    }
  }

  const handleRangeChange = (value: string) => {
    setRange(value)
  }

  const handleRefresh = async () => {
    if (!selectedServer) return
    await triggerRefresh(selectedServer.id)
  }

  const latestMetric: MetricSnapshot | null | undefined = selectedServer?.latest

  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <FeatureGrid />
        <ServerForm onSubmit={handleCreate} />

        <section id="servers" className="app__servers">
          <div className="app__servers-header">
            <h2>监控中的服务器</h2>
            <span>{servers.length} 个节点</span>
          </div>
          {loading && <p>数据加载中...</p>}
          {error && <p className="error">{error}</p>}
          <div className="app__server-grid">
            {servers.map(server => (
              <ServerCard
                key={server.id}
                server={server}
                onSelect={item => setSelectedId(item.id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>

        {selectedServer && (
          <MetricsDashboard
            serverName={selectedServer.name}
            data={chartData}
            summary={summary}
            insights={insights}
            trends={trends}
            activeRange={range}
            onRangeChange={handleRangeChange}
            onExport={() => openExport(selectedServer.id)}
            onRefresh={handleRefresh}
            latest={latestMetric ?? null}
          />
        )}

        {!selectedServer && !detailLoading && (
          <div className="app__placeholder">
            <h3>尚未选择服务器</h3>
            <p>请先在上方添加或选择一个服务器，即可查看实时数据和历史分析。</p>
          </div>
        )}
      </main>
      <footer className="app__footer">
        <div>
          <strong>Minecraft 服务器智能监控平台</strong>
          <span>赋能商业化服务器的稳定运行与持续增长</span>
        </div>
        <div>
          <a href="mailto:team@example.com">商务合作</a>
          <a href="https://minecraft.fandom.com/" target="_blank" rel="noreferrer">Minecraft Wiki</a>
        </div>
      </footer>
    </div>
  )
}

export default App
