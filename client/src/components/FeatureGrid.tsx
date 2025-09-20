import React from 'react'
import './FeatureGrid.css'

const features = [
  {
    title: '实时在线监测',
    description: '以分钟级频率主动 Ping 服务器，捕捉在线人数、延迟、版本等核心指标，并支持实时推送。',
    icon: '⏱️'
  },
  {
    title: '历史留存与趋势分析',
    description: '自动保存完整监控历史，输出日级趋势、峰值分析、稳定性区间等运营决策指标。',
    icon: '📈'
  },
  {
    title: '一键导出与报表',
    description: '支持 CSV 导出以及自定义备注、标签管理，方便团队跨部门共享与复盘。',
    icon: '🧾'
  },
  {
    title: '智能运营建议',
    description: '内置数据智能引擎，基于活跃度、在线率、延迟等表现给出针对性运营优化建议。',
    icon: '🧠'
  }
]

const FeatureGrid: React.FC = () => (
  <section id="features" className="feature-grid">
    {features.map(feature => (
      <article key={feature.title}>
        <div className="feature-grid__icon">{feature.icon}</div>
        <h3>{feature.title}</h3>
        <p>{feature.description}</p>
      </article>
    ))}
  </section>
)

export default FeatureGrid
