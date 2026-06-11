#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(__dirname, "api/data/menu.json"), "utf-8"));

const server = new Server({ name: "heytea-mcp", version: "0.1.0" }, { capabilities: { tools: {} } });

const TOOLS = [
  { name: "get_menu", description: "获取喜茶完整产品菜单", inputSchema: { type: "object", properties: { category: { type: "string" } } } },
  { name: "recommend_drink", description: "根据口味偏好推荐喜茶饮品", inputSchema: { type: "object", properties: { preference: { type: "string" }, exclude: { type: "string" } }, required: ["preference"] } },
  { name: "get_product_detail", description: "查询某款喜茶产品详细信息", inputSchema: { type: "object", properties: { product_name: { type: "string" } }, required: ["product_name"] } },
  { name: "get_customization_guide", description: "获取糖度冰量定制说明", inputSchema: { type: "object", properties: {} } },
  { name: "get_store_info", description: "查询喜茶门店城市和点单方式", inputSchema: { type: "object", properties: { city: { type: "string" } } } },
  { name: "get_membership_info", description: "查询喜茶GO会员体系信息", inputSchema: { type: "object", properties: {} } },
  { name: "get_collaboration_info", description: "查询喜茶历史联名合作", inputSchema: { type: "object", properties: {} } },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  let result: any;

  switch (name) {
    case "get_menu": {
      let products = data.products;
      if (args.category) products = products.filter((p: any) => p.category === args.category);
      result = { total: products.length, products: products.map((p: any) => ({ name: p.name, price_range: `¥${p.price_range}`, description: p.description, tips: p.tips, customization: p.customization })) };
      break;
    }
    case "recommend_drink": {
      const pref = (args.preference || "").toLowerCase();
      const excl = (args.exclude || "").toLowerCase();
      let c = data.products.filter((p: any) => {
        if (excl.includes("椰子") && p.name.includes("椰")) return false;
        if (excl.includes("芝士") && p.category === "cheese_tea") return false;
        if (excl.includes("奶") && p.category === "milk_tea") return false;
        return true;
      });
      if (pref.includes("低卡") || pref.includes("健康")) c = c.filter((p: any) => p.category === "pure_tea");
      else if (pref.includes("果") || pref.includes("清爽")) c = c.filter((p: any) => p.category === "fruit_tea");
      else if (pref.includes("浓") || pref.includes("奶")) c = c.filter((p: any) => p.category === "milk_tea" || p.category === "cheese_tea");
      if (c.length === 0) c = data.products.slice(0, 3);
      result = { recommendations: c.slice(0, 3).map((p: any) => ({ name: p.name, price: `¥${p.price_range}`, why: p.description, tip: p.tips })) };
      break;
    }
    case "get_product_detail": {
      const p = data.products.find((p: any) => p.name.includes(args.product_name) || args.product_name.includes(p.name));
      result = p ? { found: true, name: p.name, price: `¥${p.price_range}`, description: p.description, calories: p.calories, customization: p.customization, tips: p.tips } : { found: false, available: data.products.map((p: any) => p.name) };
      break;
    }
    case "get_customization_guide": result = data.customization_guide; break;
    case "get_store_info": {
      if (args.city) {
        const has = data.store_cities.some((c: string) => c.includes(args.city) || args.city.includes(c));
        result = { city: args.city, has_store: has, message: has ? `${args.city}有喜茶门店，请在喜茶GO查询具体地址` : `未收录${args.city}门店` };
      } else {
        result = { covered_cities: data.store_cities, order_channels: data.order_channels };
      }
      break;
    }
    case "get_membership_info": result = data.membership; break;
    case "get_collaboration_info": result = { collaborations: data.collaborations }; break;
    default: result = { error: `未知工具: ${name}` };
  }

  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
