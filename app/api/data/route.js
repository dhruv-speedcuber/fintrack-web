import { kv } from "@vercel/kv";

const KEY = "fintrack:data";

const DEMO_DATA = {
  accounts: [
    { id: 1, name: "HDFC Savings", type: "Bank", balance: 125000 },
    { id: 2, name: "Cash on Hand", type: "Cash", balance: 5000 },
    { id: 3, name: "PhonePe", type: "Digital Wallet", balance: 2500 },
    { id: 4, name: "LIC Fixed Deposit", type: "Fixed Deposit", balance: 50000 },
  ],
  investments: [
    { id: 1, name: "Reliance Industries", type: "Stocks", invested: 50000, current: 62000, notes: "NSE" },
    { id: 2, name: "Bitcoin", type: "Crypto", invested: 30000, current: 45000, notes: "" },
    { id: 3, name: "Axis Bluechip Fund", type: "Mutual Fund", invested: 100000, current: 118000, notes: "SIP 5k/mo" },
    { id: 4, name: "Digital Gold", type: "Gold", invested: 20000, current: 22500, notes: "" },
  ],
  goals: [
    { id: 1, name: "🚗 Buy a Car", target: 800000, saved: 250000, date: "2027-06" },
    { id: 2, name: "🏖️ Goa Trip", target: 80000, saved: 55000, date: "2026-12" },
    { id: 3, name: "🛡️ Emergency Fund", target: 300000, saved: 180000, date: "2026-10" },
  ],
  liabilities: [
    { id: 1, name: "Home Loan", type: "Home Loan", total: 2500000, remaining: 1800000, rate: 8.5, emi: 22000 },
  ],
  snapshots: [
    { label: "Jan", nw: 350000 }, { label: "Feb", nw: 368000 }, { label: "Mar", nw: 385000 },
    { label: "Apr", nw: 405000 }, { label: "May", nw: 430000 }, { label: "Jun", nw: 452000 },
  ],
};

export async function GET() {
  try {
    const data = await kv.get(KEY);
    return Response.json(data || DEMO_DATA);
  } catch (e) {
    return Response.json(DEMO_DATA);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await kv.set(KEY, body);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
