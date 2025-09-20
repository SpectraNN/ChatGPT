# Minecraft 服务器智能监控平台

一个面向商业化 Minecraft 服务器打造的全栈监控平台，提供实时在线人数采集、历史数据持久化、趋势分析、智能洞察和报表导出等功能。

## 功能亮点

- 🚀 **分钟级实时采集**：后端常驻监控任务基于 `minecraft-server-util` 主动探测服务器状态，捕捉在线人数、最大人数、延迟、版本、Motd 等指标。
- 💾 **自动持久化**：所有原始采样数据持续写入 `data/monitoring.json`，支持长期留存与再次分析。
- 📊 **高级分析仪表盘**：React 前端以图表、卡片等方式呈现峰值、平均值、在线率、稳定运行时段、日度对比等关键指标。
- 🔔 **实时推送**：通过 Server-Sent Events 实现前端无刷新接收最新采样结果。
- 📥 **一键导出**：支持 CSV 导出历史监控数据，方便与外部团队共享。
- 🧠 **智能建议**：内置运营建议与稳定性洞察模块，帮助快速定位潜在风险。

## 项目结构

```
├── client/   # Vite + React 前端
├── server/   # Express 后端服务
└── data/     # 监控数据持久化目录
```

## 快速开始

### 1. 安装依赖

```bash
cd server && npm install
cd ../client && npm install
```

### 2. 启动后端

```bash
cd server
npm start
```

服务默认运行在 `http://localhost:4000`。

### 3. 启动前端

```bash
cd client
npm run dev
```

前端默认运行在 `http://localhost:5173` 并自动代理 `/api` 请求到后端。

## 自定义配置

- 通过 `POST /api/servers` 可新增监控节点，支持自定义名称、标签、备注以及监控频率（最低 15 秒）。
- `GET /api/servers/:id/stream` 提供实时数据流接口，可扩展对接企业自有看板或消息系统。
- 数据默认保存在 `data/monitoring.json`，如需接入数据库可替换 `server/src/database.js` 中的实现。

## 生产部署建议

- 使用 `pm2`/`systemd` 等方式守护后端服务，确保监控任务常驻运行。
- 前端可执行 `npm run build` 后部署至任意静态资源托管平台。
- 建议配置 HTTPS 与访问控制，以保护运营数据安全。

## 许可证

MIT
