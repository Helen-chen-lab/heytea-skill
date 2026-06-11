# 喜茶 HEYTEA Skill 🧋

[![Version](https://img.shields.io/badge/version-0.1.0-pink)](https://github.com/YOUR_USERNAME/heytea-skill)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![MCP](https://img.shields.io/badge/protocol-MCP-purple)](https://modelcontextprotocol.io)
[![Transport](https://img.shields.io/badge/transport-Streamable%20HTTP-orange)](https://modelcontextprotocol.io)

让你的 AI 真正懂喜茶。安装这个 Skill，AI 就能回答关于喜茶的一切：有什么产品、推荐什么口味、糖度怎么选、哪些城市有门店、黑卡值不值得买。

## 能做什么

| 能力 | 你可以问 |
|------|---------|
| 🍵 产品查询 | "喜茶有什么果茶？" / "菜单给我看看" |
| 🎯 口味推荐 | "我要低卡清爽的" / "不知道点什么推荐一下" |
| 🔍 产品详情 | "多肉葡萄是什么？" / "波波冰热量多少" |
| ⚙️ 定制指南 | "少糖是几分甜？" / "冰量怎么选" |
| 🗺 门店查询 | "上海有喜茶吗？" / "怎么在线点单" |
| 👑 会员信息 | "黑卡有什么用？" / "积分怎么用" |
| 🤝 联名历史 | "喜茶跟哪些品牌联过名？" |

## 快速接入

在 Claude / Cherry Studio / Cursor 中添加以下 MCP 配置：

```json
{
  "mcpServers": {
    "heytea": {
      "type": "streamablehttp",
      "url": "https://YOUR_DEPLOY_URL/mcp"
    }
  }
}
```

### 命令行工具

```bash
npx heytea-cli menu                        # 查看菜单
npx heytea-cli menu --category fruit       # 按分类筛选
npx heytea-cli detail "多肉葡萄"            # 查产品详情
npx heytea-cli recommend "低卡清爽"         # 按口味推荐
npx heytea-cli store --city 上海            # 查门店城市
npx heytea-cli sugar                       # 糖度冰量指南
```

## 本地开发

```bash
cd server && npm install && npm run dev
# MCP Server 启动在 http://localhost:3000/mcp

cd cli && npm install
npx tsx index.ts menu
```

## 技术架构

| 项目 | 说明 |
|------|------|
| 协议 | MCP (Model Context Protocol) |
| 传输 | Streamable HTTP |
| 框架 | Hono + Node.js |
| 部署 | Vercel / 腾讯云 CloudBase |

## 工具列表

| Tool | 说明 |
|------|------|
| `get_menu` | 完整菜单，支持分类筛选 |
| `recommend_drink` | 按口味偏好推荐 |
| `get_product_detail` | 产品详情 & 喝法建议 |
| `get_customization_guide` | 糖度 & 冰量说明 |
| `get_store_info` | 门店城市 & 点单方式 |
| `get_membership_info` | 会员积分 & 黑卡权益 |
| `get_collaboration_info` | 联名历史 |

---
*Demo 项目，与喜茶官方无关 | Made by [LEYEX](https://github.com/YOUR_USERNAME)*
