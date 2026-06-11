#!/usr/bin/env node
/**
 * heytea-cli — 喜茶命令行工具
 *
 * 用法：
 *   npx heytea menu                    # 查看全部菜单
 *   npx heytea menu --category fruit   # 按分类查看
 *   npx heytea detail "多肉葡萄"        # 查看产品详情
 *   npx heytea recommend "低卡清爽"     # 按口味推荐
 *   npx heytea store --city 上海        # 查门店
 *   npx heytea sugar                   # 糖度冰量指南
 *   npx heytea member                  # 会员信息
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "../server/data/menu.json");

// ─── 颜色工具 ─────────────────────────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
  pink: "\x1b[95m",
};

const bold = (s: string) => `${c.bold}${s}${c.reset}`;
const green = (s: string) => `${c.green}${s}${c.reset}`;
const yellow = (s: string) => `${c.yellow}${s}${c.reset}`;
const cyan = (s: string) => `${c.cyan}${s}${c.reset}`;
const pink = (s: string) => `${c.pink}${s}${c.reset}`;
const gray = (s: string) => `${c.gray}${s}${c.reset}`;

// ─── 数据加载 ─────────────────────────────────────────────────────────────────
function loadData() {
  return JSON.parse(readFileSync(DATA_PATH, "utf-8"));
}

// ─── 命令实现 ─────────────────────────────────────────────────────────────────

function printBanner() {
  console.log(`
${pink("🧋 HEYTEA CLI")} ${gray("— 喜茶命令行工具 v0.1.0")}
${gray("────────────────────────────────────")}`);
}

function cmdMenu(category?: string) {
  const data = loadData();
  let products = data.products;

  const catMap: Record<string, string> = {
    fruit: "fruit_tea",
    cheese: "cheese_tea",
    pure: "pure_tea",
    milk: "milk_tea",
    coffee: "coffee",
    果茶: "fruit_tea",
    芝士茶: "cheese_tea",
    纯茶: "pure_tea",
    奶茶: "milk_tea",
  };

  const catId = category ? catMap[category] ?? category : null;
  if (catId) products = products.filter((p: { category: string }) => p.category === catId);

  const catName = catId
    ? data.categories.find((cat: { id: string; name: string }) => cat.id === catId)?.name ?? catId
    : "全部";

  printBanner();
  console.log(`${bold("📋 菜单")} ${cyan(`[${catName}]`)} — 共 ${products.length} 款\n`);

  const byCat: Record<string, typeof products> = {};
  for (const p of products) {
    if (!byCat[p.category]) byCat[p.category] = [];
    byCat[p.category].push(p);
  }

  for (const [cid, items] of Object.entries(byCat)) {
    const catLabel = data.categories.find((cat: { id: string; name: string }) => cat.id === cid)?.name ?? cid;
    console.log(`${yellow(`▌ ${catLabel}`)}`);
    for (const p of items as typeof products) {
      const tags = p.tags.map((t: string) => gray(`[${t}]`)).join(" ");
      console.log(`  ${bold(p.name)}  ${green(`¥${p.price_range}`)}  ${tags}`);
      console.log(`  ${gray(p.description)}`);
      console.log();
    }
  }

  console.log(gray(`提示：npx heytea detail "产品名" 查看详情  |  npx heytea recommend "口味偏好" 获取推荐`));
}

function cmdDetail(name: string) {
  const data = loadData();
  const product = data.products.find(
    (p: { name: string }) => p.name.includes(name) || name.includes(p.name)
  );

  printBanner();

  if (!product) {
    console.log(`${yellow("⚠️")} 没有找到"${name}"\n`);
    console.log("当前可查询的产品：");
    data.products.forEach((p: { name: string }) => console.log(`  • ${p.name}`));
    return;
  }

  const catName = data.categories.find((c: { id: string; name: string }) => c.id === product.category)?.name;

  console.log(`${bold(pink(`🧋 ${product.name}`))}  ${green(`¥${product.price_range}`)}\n`);
  console.log(`${cyan("分类：")} ${catName}`);
  console.log(`${cyan("简介：")} ${product.description}\n`);

  console.log(`${yellow("📊 营养（参考值）")}`);
  console.log(`  热量：${product.calories}\n`);

  console.log(`${yellow("⚙️  定制选项")}`);
  console.log(`  糖度：${product.customization.sugar.join(" / ")}`);
  console.log(`  冰量：${product.customization.ice.join(" / ")}`);
  console.log(`  杯型：${product.customization.size.join(" / ")}\n`);

  console.log(`${yellow("💡 喝法建议")}`);
  console.log(`  ${product.tips}\n`);

  console.log(`${yellow("🏷  标签：")} ${product.tags.map((t: string) => cyan(`[${t}]`)).join(" ")}`);
}

function cmdRecommend(preference: string, exclude?: string) {
  const data = loadData();
  const pref = preference.toLowerCase();
  const excl = (exclude ?? "").toLowerCase();

  let candidates = data.products.filter((p: { name: string; category: string; tags: string[] }) => {
    if (excl.includes("椰子") && p.name.includes("椰")) return false;
    if (excl.includes("芝士") && p.category === "cheese_tea") return false;
    if (excl.includes("奶") && p.category === "milk_tea") return false;
    if (excl.includes("果肉") && p.tags.includes("果肉多")) return false;
    return true;
  });

  if (pref.includes("低卡") || pref.includes("减糖") || pref.includes("健康")) {
    candidates = candidates.filter(
      (p: { category: string; tags: string[] }) => p.category === "pure_tea" || p.tags.includes("低卡")
    );
  } else if (pref.includes("果") || pref.includes("清爽") || pref.includes("水果")) {
    candidates = candidates.filter((p: { category: string }) => p.category === "fruit_tea");
  } else if (pref.includes("浓") || pref.includes("奶") || pref.includes("丝滑")) {
    candidates = candidates.filter(
      (p: { category: string }) => p.category === "milk_tea" || p.category === "cheese_tea"
    );
  } else if (pref.includes("茶味") || pref.includes("纯茶")) {
    candidates = candidates.filter((p: { category: string }) => p.category === "pure_tea");
  }

  if (candidates.length === 0) candidates = data.products.slice(0, 3);
  const top = candidates.slice(0, 3);

  printBanner();
  console.log(`${bold("🎯 为你推荐")} ${gray(`（偏好：${preference}）`)}\n`);

  top.forEach((p: { name: string; price_range: string; description: string; tips: string }, i: number) => {
    console.log(`${yellow(`${i + 1}. ${bold(p.name)}`)}  ${green(`¥${p.price_range}`)}`);
    console.log(`   ${p.description}`);
    console.log(`   ${gray("💡 " + p.tips)}\n`);
  });

  console.log(gray(`npx heytea detail "产品名" 查看更多详情`));
}

function cmdStore(city?: string) {
  const data = loadData();
  printBanner();

  if (city) {
    const has = data.store_cities.some(
      (c: string) => c.includes(city) || city.includes(c)
    );
    if (has) {
      console.log(`${green("✅")} ${bold(city)} 有喜茶门店\n`);
      console.log(`具体门店地址请在 ${cyan("喜茶GO小程序")} 内查询\n`);
    } else {
      console.log(`${yellow("⚠️")} 数据中未收录 ${bold(city)} 的喜茶门店\n`);
      console.log(`建议在喜茶GO小程序内搜索最新开店情况\n`);
    }
  } else {
    console.log(`${bold("🗺  喜茶已覆盖城市")} (${data.store_cities.length} 个)\n`);
    const chunks: string[][] = [];
    for (let i = 0; i < data.store_cities.length; i += 6) {
      chunks.push(data.store_cities.slice(i, i + 6));
    }
    chunks.forEach((row: string[]) => console.log("  " + row.join("  ")));
    console.log();
  }

  console.log(`${yellow("📱 点单方式")}`);
  console.log(`  • 喜茶GO小程序（推荐，可预约/跳过排队）`);
  console.log(`  • 美团外卖 / 饿了么（部分门店支持）`);
  console.log(`  • 到店扫码点单`);
}

function cmdSugar() {
  const data = loadData();
  const guide = data.customization_guide;
  printBanner();

  console.log(`${bold("🍬 糖度指南")}\n`);
  for (const [level, desc] of Object.entries(guide.sugar_levels)) {
    console.log(`  ${yellow(level.padEnd(6))} ${desc}`);
  }

  console.log(`\n${bold("🧊 冰量指南")}\n`);
  for (const [level, desc] of Object.entries(guide.ice_levels)) {
    console.log(`  ${cyan(level.padEnd(6))} ${desc}`);
  }

  console.log(`\n${bold("💡 通用建议")}`);
  console.log(`  ${guide.tips}`);
}

function cmdMember() {
  const data = loadData();
  const m = data.membership;
  printBanner();

  console.log(`${bold(pink("👑 喜茶GO会员体系"))}\n`);
  console.log(`${yellow("积分规则：")} ${m.points}`);
  console.log(`${yellow("会员等级：")} ${m.levels.join(" → ")}\n`);
  console.log(`${bold("🖤 黑卡会员")}  ${green(m.black_card.price)}`);
  m.black_card.benefits.forEach((b: string) => console.log(`  ✓ ${b}`));
}

function cmdHelp() {
  printBanner();
  console.log(`${bold("用法：")}\n`);
  const cmds = [
    ["heytea menu", "查看全部菜单"],
    ["heytea menu --category fruit", "按分类查看（fruit/cheese/pure/milk/coffee）"],
    ['heytea detail "多肉葡萄"', "查看某款产品详情"],
    ['heytea recommend "低卡清爽"', "按口味推荐"],
    ['heytea recommend "清爽" --exclude "奶"', "带排除条件的推荐"],
    ["heytea store", "查看覆盖城市"],
    ["heytea store --city 上海", "查某城市是否有门店"],
    ["heytea sugar", "糖度 & 冰量指南"],
    ["heytea member", "会员 & 积分信息"],
  ];
  cmds.forEach(([cmd, desc]) => {
    console.log(`  ${cyan(cmd.padEnd(40))} ${gray(desc)}`);
  });
  console.log();
}

// ─── 参数解析 & 入口 ───────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const cmd = args[0];

function getFlag(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
}

switch (cmd) {
  case "menu":
    cmdMenu(getFlag("--category"));
    break;
  case "detail":
    if (!args[1]) {
      console.log('用法: heytea detail "产品名"');
    } else {
      cmdDetail(args[1]);
    }
    break;
  case "recommend":
    if (!args[1]) {
      console.log('用法: heytea recommend "口味偏好" [--exclude "不喜欢的"]');
    } else {
      cmdRecommend(args[1], getFlag("--exclude"));
    }
    break;
  case "store":
    cmdStore(getFlag("--city"));
    break;
  case "sugar":
    cmdSugar();
    break;
  case "member":
    cmdMember();
    break;
  case "help":
  case "--help":
  case "-h":
  case undefined:
    cmdHelp();
    break;
  default:
    console.log(`未知命令: ${cmd}\n运行 heytea help 查看帮助`);
}
