import React, { useState } from 'react'
import type { ServerCreateRequest } from '../utils/api'
import './ServerForm.css'

interface Props {
  onSubmit: (payload: ServerCreateRequest) => Promise<void>
}

const defaultValues: ServerCreateRequest = {
  address: '',
  name: '',
  port: 25565,
  intervalSeconds: 60,
  notes: '',
  tags: []
}

const ServerForm: React.FC<Props> = ({ onSubmit }) => {
  const [values, setValues] = useState<ServerCreateRequest>({ ...defaultValues })
  const [tagText, setTagText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setValues(prev => ({ ...prev, [name]: name === 'port' || name === 'intervalSeconds' ? Number(value) : value }))
  }

  const handleAddTag = () => {
    if (!tagText.trim()) return
    setValues(prev => ({ ...prev, tags: [...(prev.tags ?? []), tagText.trim()] }))
    setTagText('')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    await onSubmit(values)
    setValues({ ...defaultValues })
    setLoading(false)
  }

  return (
    <form className="server-form" onSubmit={handleSubmit}>
      <h2>添加新的服务器监控</h2>
      <div className="server-form__grid">
        <label>
          服务器地址/IP
          <input
            name="address"
            required
            placeholder="例如: mc.hypixel.net"
            value={values.address}
            onChange={handleChange}
          />
        </label>
        <label>
          自定义名称
          <input
            name="name"
            placeholder="展示名称"
            value={values.name ?? ''}
            onChange={handleChange}
          />
        </label>
        <label>
          端口
          <input
            name="port"
            type="number"
            min={1}
            max={65535}
            value={values.port}
            onChange={handleChange}
          />
        </label>
        <label>
          监控频率（秒）
          <input
            name="intervalSeconds"
            type="number"
            min={15}
            step={15}
            value={values.intervalSeconds}
            onChange={handleChange}
          />
        </label>
      </div>
      <label>
        标签
        <div className="server-form__tags">
          <input
            placeholder="按 Enter 添加标签"
            value={tagText}
            onChange={event => setTagText(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleAddTag()
              }
            }}
          />
          <button type="button" onClick={handleAddTag}>添加</button>
        </div>
        <div className="server-form__taglist">
          {(values.tags ?? []).map(tag => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </label>
      <label>
        备注
        <textarea
          name="notes"
          rows={3}
          placeholder="记录服务器机房位置、用途、维护人等信息"
          value={values.notes ?? ''}
          onChange={handleChange}
        />
      </label>
      <button type="submit" disabled={loading}>{loading ? '提交中...' : '开始监控'}</button>
    </form>
  )
}

export default ServerForm
