import React from 'react'
import './Header.css'

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header__brand">
        <div className="header__logo">🛡️</div>
        <div>
          <h1>Minecraft 服务器智能监控平台</h1>
          <p>分钟级实时监控 · 长周期数据留存 · 智能化运营分析</p>
        </div>
      </div>
      <div className="header__actions">
        <a href="#features">功能亮点</a>
        <a href="#analytics">智能分析</a>
        <a href="#servers">监控面板</a>
      </div>
    </header>
  )
}

export default Header
