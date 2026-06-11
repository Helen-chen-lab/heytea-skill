# 🧋 喜茶 HEYTEA MCP Skill

让你的 AI 真正懂喜茶。在 Claude 里直接问喜茶的一切——产品推荐、口味定制、门店查询、会员积分、联名历史。

![版本](https://img.shields.io/badge/version-0.1.0-pink)
![协议](https://img.shields.io/badge/protocol-MCP-purple)
![部署](https://img.shields.io/badge/deploy-Vercel-black)

---

## 能问什么

| 你说 | AI 做 |
|------|-------|
| "喜茶有什么果茶？" | 返回完整果茶菜单 |
| "我要低卡清爽的，推荐什么？" | 按口味智能推荐 |
| "多肉葡萄热量多少？怎么选糖度？" | 产品详情 + 定制建议 |
| "上海有喜茶吗？怎么点单？" | 门店城市 + 点单方式 |
| "喜茶黑卡值得买吗？" | 会员权益说明 |
| "喜茶跟哪些品牌联过名？" | 历史联名一览 |

---

## 接入方法

### 方法一：Claude Desktop（推荐）

**第一步：确认已安装 Node.js**
```bash
node -v  # 需要 v18 以上
```

**第二步：克隆项目**
```bash
git clone https://github.com/Helen-chen-lab/heytea-skill.git
cd heytea-skill
npm install
```

**第三步：修改 Claude Desktop 配置**

打开配置文件：
- Mac：`~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows：`%APPDATA%\Claude\claude_desktop_config.json`

在 `mcpServers` 里加入（路径改成你自己的）：
```json
{
  "mcpServers": {
    "heytea": {
      "command": "npx",
      "args": [
        "tsx",
        "/你的路径/heytea-skill/mcp-stdio.ts"
      ]
    }
  }
}
```

**第四步：重启 Claude Desktop**

重启后点左下角 `+` → Connectors，看到 `heytea` 蓝色开启即成功。

---

### 方法二：直接调用 MCP 端点（开发者）

公网端点已部署在 Vercel，直接用：
https://heytea-skill.vercel.app/mcp
配置示例：
```json
{
  "mcpServers": {
    "heytea": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://heytea-skill.vercel.app/mcp"
      ]
    }
  }
}
```

---

### 方法三：命令行工具

```bash
# 查看菜单
npx tsx cli/index.ts menu

# 按分类筛选
npx tsx cli/index.ts menu --category fruit

# 查产品详情
npx tsx cli/index.ts detail "多肉葡萄"

# 按口味推荐
npx tsx cli/index.ts recommend "低卡清爽"

# 查门店
npx tsx cli/index.ts store --city 上海

# 糖度冰量指南
npx tsx cli/index.ts sugar
```

---

## 工具列表

| 工具 | 说明 |
|------|------|
| `get_menu` | 完整菜单，支持分类筛选 |
| `recommend_drink` | 按口味偏好推荐饮品 |
| `get_product_detail` | 产品详情、热量、喝法建议 |
| `get_customization_guide` | 糖度 & 冰量定制说明 |
| `get_store_info` | 门店城市覆盖 & 点单方式 |
| `get_membership_info` | 会员积分 & 黑卡权益 |
| `get_collaboration_info` | 历史联名合作 |

---

## 项目结构
heytea-skill/
├── api/
│   ├── index.ts          # Vercel MCP Server（HTTP）
│   └── data/menu.json    # 喜茶产品数据
├── mcp-stdio.ts          # Claude Desktop MCP Server（stdio）
├── cli/index.ts          # 命令行工具
├── dev.ts                # 本地开发启动
├── SKILL.md              # AI Skill 说明文档
├── skill.json            # MCP 元数据
└── vercel.json           # Vercel 部署配置
---

## 本地开发

```bash
git clone https://github.com/Helen-chen-lab/heytea-skill.git
cd heytea-skill
npm install
npx tsx dev.ts
# → http://localhost:3000/mcp
```

---

## 声明

本项目为独立 Demo，与喜茶官方无关。产品信息仅供参考，实际以喜茶官方渠道为准。

Made with 🧋 by [LEYEX](https://github.com/Helen-chen-lab)
