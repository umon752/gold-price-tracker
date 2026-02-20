import type { TGoldPricePoint, TTimeRange } from '~/types/gold'

const RANGE_DAYS: Record<TTimeRange, number> = {
  day: 7,
  week: 30,
  month: 90,
  year: 365,
}

// 對應臺灣銀行 search_range 參數
const RANGE_SEARCH: Record<TTimeRange, string> = {
  day: 'ltm',
  week: 'ltm',
  month: 'half',
  year: 'year',
}

/** 從 HTML 中解析指定名稱的 [timestamp, price] 資料序列 */
function extractPriceData(html: string, seriesName: string): [number, number][] | null {
  const nameIdx = html.indexOf(`"name":"${seriesName}"`)
  if (nameIdx === -1) return null

  const dataKey = '"data":['
  const dataIdx = html.lastIndexOf(dataKey, nameIdx)
  if (dataIdx === -1) return null

  const start = dataIdx + dataKey.length - 1
  let depth = 0
  let end = start
  for (let i = start; i < html.length; i++) {
    if (html[i] === '[') depth++
    else if (html[i] === ']') {
      depth--
      if (depth === 0) { end = i + 1; break }
    }
  }

  try {
    return JSON.parse(html.substring(start, end))
  }
  catch { return null }
}

/** 抓取臺灣銀行黃金存摺歷史牌價 */
async function fetchTaiwanBankHistory(searchRange: string): Promise<TGoldPricePoint[] | null> {
  try {
    const html = await $fetch<string>('https://rate.bot.com.tw/gold/chart', {
      method: 'POST',
      body: `search_range=${searchRange}&currency=TWD&commodity=gold_passbook`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://rate.bot.com.tw/gold/passbook',
      },
    })

    const buyData = extractPriceData(html, '本行買入價格')
    const sellData = extractPriceData(html, '本行賣出價格')
    if (!buyData || !sellData || buyData.length === 0) return null

    // 以時間戳為 key 合併買入/賣出
    const priceMap = new Map<string, { buy: number; sell: number }>()
    for (const [ts, buy] of buyData) {
      const date = new Date(ts).toISOString().split('T')[0]
      const entry = priceMap.get(date) ?? { buy: 0, sell: 0 }
      priceMap.set(date, { ...entry, buy: Math.round(buy) })
    }
    for (const [ts, sell] of sellData) {
      const date = new Date(ts).toISOString().split('T')[0]
      const entry = priceMap.get(date) ?? { buy: 0, sell: 0 }
      priceMap.set(date, { ...entry, sell: Math.round(sell) })
    }

    return [...priceMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .filter(([, p]) => p.buy > 0 && p.sell > 0)
      .map(([date, p]) => ({ date, buyPrice: p.buy, sellPrice: p.sell }))
  }
  catch (e) {
    console.error('[gold/history] 抓取臺灣銀行歷史資料失敗:', e)
    return null
  }
}

export default defineEventHandler(async (event): Promise<TGoldPricePoint[]> => {
  const query = getQuery(event)
  const range = (query.range as TTimeRange) in RANGE_DAYS
    ? (query.range as TTimeRange)
    : 'month'

  const days = RANGE_DAYS[range]
  const liveHistory = await fetchTaiwanBankHistory(RANGE_SEARCH[range])
  if (liveHistory && liveHistory.length > 0) {
    return liveHistory.slice(-days)
  }

  // fallback: 模擬資料
  return generateGoldHistory(days)
})
