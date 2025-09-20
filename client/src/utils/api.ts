import axios from 'axios'

export interface ServerPayload {
  id: string
  name: string
  address: string
  port: number
  intervalSeconds: number
  notes: string
  tags: string[]
  createdAt: string
  summary?: any
  latest?: MetricSnapshot | null
}

export interface MetricSnapshot {
  timestamp: string
  online: boolean
  latency?: number
  version?: string
  motd?: string
  players?: {
    max: number
    online: number
    sample: Array<{ id: string; name: string }>
  }
  error?: string
}

export interface ServerCreateRequest {
  name?: string
  address: string
  port?: number
  intervalSeconds?: number
  notes?: string
  tags?: string[]
}

export async function fetchServers () {
  const { data } = await axios.get<ServerPayload[]>('/api/servers')
  return data
}

export async function createServer (payload: ServerCreateRequest) {
  const { data } = await axios.post<ServerPayload>('/api/servers', payload)
  return data
}

export async function updateServer (id: string, payload: Partial<ServerCreateRequest>) {
  const { data } = await axios.patch<ServerPayload>(`/api/servers/${id}`, payload)
  return data
}

export async function deleteServer (id: string) {
  await axios.delete(`/api/servers/${id}`)
}

export async function fetchMetrics (id: string, range?: string) {
  const { data } = await axios.get(`/api/servers/${id}/metrics`, { params: { range } })
  return data
}

export async function fetchInsights (id: string) {
  const { data } = await axios.get(`/api/servers/${id}/insights`)
  return data
}

export async function triggerRefresh (id: string) {
  const { data } = await axios.post<MetricSnapshot>(`/api/servers/${id}/refresh`)
  return data
}

export function openExport (id: string) {
  const url = `/api/servers/${id}/export`
  window.open(url, '_blank')
}

export function subscribeToStream (id: string, handler: (metric: MetricSnapshot) => void) {
  const eventSource = new EventSource(`/api/servers/${id}/stream`)
  eventSource.onmessage = event => {
    try {
      const payload: MetricSnapshot = JSON.parse(event.data)
      handler(payload)
    } catch (error) {
      console.error(error)
    }
  }
  return () => eventSource.close()
}
