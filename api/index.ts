import { Hono } from "hono";
import { cors } from "hono/cors";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// 读取数据（兼容 Vercel 和本地）
const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  readFileSync(join(__dirname, "data/menu.json"), "utf-8")
);

const app = new Hono();
app.use("*", cors());

// ─── Tools ────────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "get_menu",
    description: "获取喜茶完整产品菜单，包含分类、产品名称、价格区间、描述、定制选项和喝法建议。当用户询问喜茶有什么产品、菜单、饮品列表时调用。",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "可选，按分类筛选：cheese_tea / fruit_tea / pure_tea / milk_tea / coffee",
        },
      },
    },
  },
  {
    name: "recommend_drink",
    description: "根据用户口味偏好智能推荐喜茶饮品。当用户描述口味偏好或说不知道点什么时调用。",
    inputSchema: {
      type: "object",
      properties: {
        preference: { type: "string", description: "口味描述，如：低卡/清爽/浓郁/果味" },
        exclude: { type: "string", description: "不喜欢的成分，如：椰子/芝士/奶/果肉" },
      },
      required: ["preference"],
    },
  },
  {
    name: "get_product_detail",
    description: "查询某款喜茶产品的详细信息，包括原料、热量、定制选项、喝法建议。",
    inputSchema: {
      type: "object",
      properties: {
        product_name: { type: "string", description: "产品名称，如：多肉葡萄、芝士芒芒" },
      },
      required: ["product_name"],
    },
  },
  {
    name: "get_customization_guide",
    description: "获取喜茶糖度、冰量定制说明和建议。",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_store_info",
    description: "查询喜茶门店城市覆盖和点单方式。",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string", description: "可选，查询特定城市" },
      },
    },
  },
  {
    name: "get_membership_info",
    description: "查询喜茶GO会员体系、积分规则、黑卡权益。",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_collaboration_info",
    description: "查询喜茶历史联名合作信息。",
    inputSchema: { type: "object", properties: {} },
  },
];

// ─── Tool 执行 ────────────────────────────────────────────────────────────────

function executeTool(name: string, args: Record<string, string>) {
  switch (name) {
    case "get_menu": {
      const { category } = args;
      let products = data.products;
      if (category) products = products.filter((p: any) => p.category === category);
      const catInfo = category ? data.categories.find((c: any) => c.id === category) : null;
      return {
        brand: data.brand.name,
        category_filter: catInfo?.name ?? "全部分类",
        total: products.length,
        products: products.map((p: any) => ({
          name: p.name,
          category: data.categories.find((c: any) => c.id === p.category)?.name,
          price_range: `¥${p.price_range}`,
          description: p.description,
          tags: p.tags,
          customization: p.customization,
          tips: p.tips,
        })),
      };
    }
    case "recommend_drink": {
      const { preference = "", exclude = "" } = args;
      const pref = preference.toLowerCase();
      const excl = exclude.toLowerCase();
      let c = data.products.filter((p: any) => {
        if (excl.includes("椰子") && p.name.includes("椰")) return false;
        if (excl.includes("芝士") && p.category === "cheese_tea") return false;
        if (excl.includes("奶") && p.category === "milk_tea") return false;
        if (excl.includes("果肉") && p.tags.includes("果肉多")) return false;
        return true;
      });
      if (pref.includes("低卡") || pref.includes("健康")) {
        c = c.filter((p: any) => p.category === "pure_tea" || p.tags.includes("低卡"));
      } else if (pref.includes("果") || pref.includes("清爽") || pref.includes("水果")) {
        c = c.filter((p: any) => p.category === "fruit_tea");
      } else if (pref.includes("浓") || pref.includes("奶") || pref.includes("丝滑")) {
        c = c.filter((p: any) => p.category === "milk_tea" || p.category === "cheese_tea");
      } else if (pref.includes("茶味") || pref.includes("纯茶")) {
        c = c.filter((p: any) => p.category === "pure_tea");
      }
      if (c.length === 0) c = data.products.slice(0, 3);
      return {
        preference_received: preference,
        recommendations: c.slice(0, 3).map((p: any) => ({
          name: p.name,
          price_range: `¥${p.price_range}`,
          why: p.description,
          tip: p.tips,
        })),
        customization_tip: "记得可以按喜好调整糖度和冰量。",
      };
    }
    case "get_product_detail": {
      const { product_name } = args;
      const p = data.products.find(
        (p: any) => p.name.includes(product_name) || product_name.includes(p.name)
      );
      if (!p) return { found: false, message: `没有找到"${product_name}"`, available: data.products.map((p: any) => p.name) };
      return {
        found: true, name: p.name,
        category: data.categories.find((c: any) => c.id === p.category)?.name,
        price_range: `¥${p.price_range}`, description: p.description,
        tags: p.tags, customization: p.customization, calories: p.calories, tips: p.tips,
      };
    }
    case "get_customization_guide": return data.customization_guide;
    case "get_store_info": {
      const { city } = args;
      if (city) {
        const has = data.store_cities.some((c: string) => c.includes(city) || city.includes(c));
        return { city, has_store: has, message: has ? `${city}有喜茶门店，请在喜茶GO查询具体地址` : `未收录${city}门店，请在喜茶GO查询最新情况`, order_channels: data.order_channels };
      }
      return { covered_cities: data.store_cities, total_cities: data.store_cities.length, order_channels: data.order_channels };
    }
    case "get_membership_info": return data.membership;
    case "get_collaboration_info": return { total: data.collaborations.length, collaborations: data.collaborations, note: "最新联名请关注喜茶官方公众号" };
    default: return { error: `未知工具: ${name}` };
  }
}

// ─── MCP 路由 ─────────────────────────────────────────────────────────────────

app.post("/mcp", async (c) => {
  const { method, params, id } = await c.req.json();

  if (method === "initialize") return c.json({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "heytea-mcp", version: "0.1.0" } } });
  if (method === "tools/list") return c.json({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
  if (method === "tools/call") {
    const { name, arguments: args = {} } = params;
    try {
      const result = executeTool(name, args);
      return c.json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } });
    } catch (e) {
      return c.json({ jsonrpc: "2.0", id, error: { code: -32603, message: String(e) } });
    }
  }
  if (method === "ping") return c.json({ jsonrpc: "2.0", id, result: {} });
  return c.json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
});

app.get("/mcp", (c) => c.json({ name: "heytea-mcp", version: "0.1.0", description: "喜茶 AI Skill MCP Server", tools: TOOLS.map(t => ({ name: t.name, description: t.description })) }));
app.get("/", (c) => c.json({ status: "ok", service: "heytea-mcp", version: "0.1.0" }));

// Vercel：导出 default，Vercel 会调用 app.fetch
export default app;
