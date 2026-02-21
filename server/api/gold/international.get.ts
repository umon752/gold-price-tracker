import type { TInternationalGoldPrice } from '~/types/gold'

const TROY_OZ_PER_GRAM = 1 / 31.1035

/**
 * 從 Stooq 抓取 XAU/USD 即時報價
 * realtime endpoint: https://stooq.com/q/l/?s=xauusd&f=sd2t2ohlcv&h&e=csv
 * daily endpoint:    https://stooq.com/q/d/l/?s=xauusd&i=d （最後兩行為前日與昨日收盤）
 */
async function fetchStooqGold(): Promise<{ price: number; prev: number; time: number } | null> {
  try {
    // 即時報價（含今日最新 close/last）
    const [realtimeText, historyText] = await Promise.all([
      $fetch<string>('https://stooq.com/q/l/?s=xauusd&f=sd2t2ohlcv&h&e=csv', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }),
      $fetch<string>('https://stooq.com/q/d/l/?s=xauusd&i=d', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }),
    ])

    // 解析即時報價：Symbol,Date,Time,Open,High,Low,Close,Volume
    const realtimeLines = realtimeText.trim().split('\n')
    const realtimeParts = realtimeLines[1]?.split(',')
    if (!realtimeParts || realtimeParts.length < 7) return null
    const price = parseFloat(realtimeParts[6]) // Close
    const dateStr = realtimeParts[1]           // YYYY-MM-DD
    const timeStr = realtimeParts[2]           // HH:MM:SS
    if (!price || isNaN(price)) return null

    // 解析每日歷史取前一日收盤：Date,Open,High,Low,Close
    const historyLines = historyText.trim().split('\n').filter(l => l && !l.startsWith('Date'))
    const prevLine = historyLines[historyLines.length - 2] // 倒數第二行 = 前一交易日
    const prevParts = prevLine?.split(',')
    const prev = prevParts ? parseFloat(prevParts[4]) : price
    if (isNaN(prev)) return null

    const time = new Date(`${dateStr}T${timeStr}Z`).getTime()

    return { price, prev, time }
  }
  catch (e) {
    console.error('[gold/international] 抓取 Stooq 失敗:', e)
    return null
  }
}

export default defineEventHandler(async (): Promise<TInternationalGoldPrice> => {
  const data = await fetchStooqGold()

  if (!data) {
    return {
      priceUSD: 0,
      priceUSDPerGram: 0,
      change: 0,
      changePercent: 0,
      updatedAt: new Date().toISOString(),
    }
  }

  const change = data.price - data.prev
  const changePercent = data.prev ? (change / data.prev) * 100 : 0

  return {
    priceUSD: Math.round(data.price * 100) / 100,
    priceUSDPerGram: Math.round(data.price * TROY_OZ_PER_GRAM * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    updatedAt: new Date(data.time).toISOString(),
  }
})
