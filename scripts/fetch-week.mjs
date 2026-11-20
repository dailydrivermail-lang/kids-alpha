#!/usr/bin/env node
// Slice 0: fetch the last week of daily closes for every company in the universe.
// Usage:  EODHD_API_KEY=xxxx node scripts/fetch-week.mjs
// Needs Node 18+ (built-in fetch). No dependencies.
//
// Each symbol lists candidate EODHD codes; the first one that returns data wins and
// is reported, so this run also verifies the tickers in SPEC.md section 4.

const KEY = process.env.EODHD_API_KEY;
if (!KEY) {
  console.error("Set EODHD_API_KEY first (free key from eodhd.com).");
  process.exit(1);
}

const us = (t) => [`${t}.US`];
const jp = (t) => [`${t}.TSE`, `${t}.T`];
const de = (t) => [`${t}.XETRA`, `${t}.DE`];

const UNIVERSE = [
  ["Take-Two", us("TTWO"), "USD"],
  ["Nintendo", jp("7974"), "JPY"],
  ["Sony", jp("6758"), "JPY"],
  ["Microsoft", us("MSFT"), "USD"],
  ["Roblox", us("RBLX"), "USD"],
  ["Capcom", jp("9697"), "JPY"],
  ["Tesla", us("TSLA"), "USD"],
  ["SpaceX", us("SPCX"), "USD"],
  ["Ferrari", us("RACE"), "USD"],
  ["Formula One Group", us("FWONK"), "USD"],
  ["Apple", us("AAPL"), "USD"],
  ["Alphabet", us("GOOGL"), "USD"],
  ["Netflix", us("NFLX"), "USD"],
  ["Disney", us("DIS"), "USD"],
  ["Spotify", us("SPOT"), "USD"],
  ["Nvidia", us("NVDA"), "USD"],
  ["Mattel", us("MAT"), "USD"],
  ["Hasbro", us("HAS"), "USD"],
  ["Bandai Namco", jp("7832"), "JPY"],
  ["Nike", us("NKE"), "USD"],
  ["Adidas", de("ADS"), "EUR"],
  ["McDonald's", us("MCD"), "USD"],
  ["Coca-Cola", us("KO"), "USD"],
];

// AUD value of one unit of each home currency (needed from Level 6).
const FX = [
  ["USD in AUD", ["USDAUD.FOREX"]],
  ["JPY in AUD", ["JPYAUD.FOREX"]],
  ["EUR in AUD", ["EURAUD.FOREX"]],
];

const iso = (d) => d.toISOString().slice(0, 10);
const to = new Date();
const from = new Date(to.getTime() - 12 * 86400000); // 12 days back covers 5+ trading days

async function eod(code) {
  const url =
    `https://eodhd.com/api/eod/${encodeURIComponent(code)}` +
    `?api_token=${KEY}&fmt=json&period=d&from=${iso(from)}&to=${iso(to)}`;
  const res = await fetch(url);
  if (!res.ok) return { error: `HTTP ${res.status}` };
  let rows;
  try {
    rows = await res.json();
  } catch {
    return { error: "not JSON" };
  }
  if (!Array.isArray(rows) || rows.length === 0) return { error: "no rows" };
  return { rows };
}

async function resolve(candidates) {
  const errors = [];
  for (const code of candidates) {
    const r = await eod(code);
    if (r.rows) return { code, rows: r.rows };
    errors.push(`${code}: ${r.error}`);
  }
  return { errors };
}

function line(name, code, extra, rows) {
  const last = rows.slice(-5);
  const cells = last.map((r) => `${r.date.slice(5)} ${Number(r.close).toFixed(2)}`);
  console.log(`${name.padEnd(18)} ${code.padEnd(13)} ${extra.padEnd(4)} ${cells.join("  |  ")}`);
}

let failed = 0;
console.log(`Daily closes ${iso(from)} to ${iso(to)} (last 5 trading days shown)\n`);

for (const [name, candidates, ccy] of UNIVERSE) {
  const r = await resolve(candidates);
  if (r.rows) line(name, r.code, ccy, r.rows);
  else {
    failed++;
    console.log(`${name.padEnd(18)} FAILED  ${r.errors.join("; ")}`);
  }
}

console.log("\nFX");
for (const [name, candidates] of FX) {
  const r = await resolve(candidates);
  if (r.rows) line(name, r.code, "", r.rows);
  else {
    failed++;
    console.log(`${name.padEnd(18)} FAILED  ${r.errors.join("; ")}`);
  }
}

console.log(failed ? `\n${failed} symbol(s) failed.` : "\nAll symbols returned data.");
process.exit(failed ? 1 : 0);
