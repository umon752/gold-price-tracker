import type { TGoldPricePoint } from '~/types/gold'

/** LCG 偽隨機數（確定性，相同 seed 永遠回傳相同值） */
function seededRandom(seed: number): number {
  const a = 1664525
  const c = 1013904223
  const m = 2 ** 32
  return ((a * seed + c) % m) / m
}

/**
 * 來自臺灣銀行黃金存摺歷史牌告的真實數據（元/克）
 * 本行買入價格 = buyPrice（客戶賣出收到）
 * 本行賣出價格 = sellPrice（客戶買入付出）
 */
/** 非交易日（週末 + 國定假日），當日漲跌應為 0 */
export const NON_TRADING_DAYS = new Set([
  // 2026 農曆新年假期（2/14 六 ～ 2/20 四）
  '2026-02-14', '2026-02-15', '2026-02-16', '2026-02-17',
  '2026-02-18', '2026-02-19', '2026-02-20',
])

const KNOWN_PRICES: Record<string, { buy: number; sell: number }> = {
  // 農曆新年休市期間，維持 2/13 收盤價不變
  '2026-02-20': { buy: 5016, sell: 5070 },
  '2026-02-19': { buy: 5016, sell: 5070 },
  '2026-02-18': { buy: 5016, sell: 5070 },
  '2026-02-17': { buy: 5016, sell: 5070 },
  '2026-02-16': { buy: 5016, sell: 5070 },
  '2026-02-15': { buy: 5016, sell: 5070 },
  '2026-02-14': { buy: 5016, sell: 5070 },
  '2026-02-13': { buy: 5016, sell: 5070 },
  '2026-02-12': { buy: 5093, sell: 5148 },
  '2026-02-11': { buy: 5091, sell: 5146 },
  '2026-02-10': { buy: 5072, sell: 5127 },
  '2026-02-09': { buy: 5060, sell: 5114 },
  '2026-02-06': { buy: 4910, sell: 4963 },
  '2026-02-05': { buy: 4986, sell: 5040 },
  '2026-02-04': { buy: 5120, sell: 5175 },
  '2026-02-03': { buy: 4936, sell: 4989 },
  '2026-02-02': { buy: 4587, sell: 4638 },
}

const SPREAD = 54 // 臺銀黃金存摺平均買賣價差（元/克）

/**
 * 產生黃金存摺歷史走勢資料：
 * - 有真實數據的日期：直接使用 KNOWN_PRICES
 * - 其餘日期：以 3,000 元/克為基準做確定性隨機漫步，趨勢走升至今約 5,000 元
 */
export function generateGoldHistory(days: number): TGoldPricePoint[] {
  const BASE_DATE = new Date('2023-01-01T00:00:00Z')
  const BASE_BUY_PRICE = 3000

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const totalDays = Math.floor((today.getTime() - BASE_DATE.getTime()) / 86400000) + 1

  let buyPrice = BASE_BUY_PRICE
  const priceMap = new Map<string, { buy: number; sell: number }>()

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(BASE_DATE)
    d.setUTCDate(d.getUTCDate() + i)
    const dateStr = d.toISOString().split('T')[0]

    if (KNOWN_PRICES[dateStr]) {
      // 真實牌告數據：直接使用，並重置隨機漫步錨點
      priceMap.set(dateStr, KNOWN_PRICES[dateStr])
      buyPrice = KNOWN_PRICES[dateStr].buy
    }
    else {
      // 非真實數據日期：以確定性隨機漫步產生
      const seed = parseInt(dateStr.replace(/-/g, ''), 10)
      const rand = seededRandom(seed)
      const change = (rand - 0.47) * 60
      buyPrice = Math.max(3000, Math.min(6000, buyPrice + change))
      priceMap.set(dateStr, { buy: Math.round(buyPrice), sell: Math.round(buyPrice) + SPREAD })
    }
  }

  const result: TGoldPricePoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const p = priceMap.get(dateStr) ?? { buy: Math.round(buyPrice), sell: Math.round(buyPrice) + SPREAD }
    result.push({ date: dateStr, buyPrice: p.buy, sellPrice: p.sell })
  }

  return result
}
