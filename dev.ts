/**
 * 本地开发启动脚本
 * 用法: npx tsx dev.ts
 */
import { serve } from "@hono/node-server";
import app from "./api/index.js";

const PORT = parseInt(process.env.PORT ?? "3000");
// @ts-ignore
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`🧋 喜茶 MCP Server 本地运行: http://localhost:${PORT}/mcp`);
  console.log(`\n接入配置：`);
  console.log(JSON.stringify({
    mcpServers: {
      heytea: {
        type: "streamablehttp",
        url: `http://localhost:${PORT}/mcp`
      }
    }
  }, null, 2));
});
