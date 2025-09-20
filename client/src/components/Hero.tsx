import React from 'react'
import './Hero.css'

const Hero: React.FC = () => (
  <section className="hero">
    <div className="hero__content">
      <h2>打造商业级的 Minecraft 运营中枢</h2>
      <p>
        面向大型服务器团队设计的可视化监控平台：支持多实例集中管控、实时预警、历史数据洞察以及一键导出报表，为服务器运维、市场活动策划与社区运营提供全面的数据支撑。
      </p>
      <div className="hero__stats">
        <div>
          <strong>∞</strong>
          <span>监控节点数量</span>
        </div>
        <div>
          <strong>60s</strong>
          <span>最低采样周期</span>
        </div>
        <div>
          <strong>365天</strong>
          <span>历史数据持久化</span>
        </div>
      </div>
    </div>
    <div className="hero__mockup">
      <div className="hero__radar">
        <div className="hero__pulse" />
        <div className="hero__pulse" />
        <div className="hero__pulse" />
        <span>实时守护</span>
      </div>
      <div className="hero__panel">
        <h3>智能诊断</h3>
        <ul>
          <li>在线率 99.2%</li>
          <li>延迟健康</li>
          <li>玩家增长趋势向好</li>
        </ul>
      </div>
    </div>
  </section>
)

export default Hero
