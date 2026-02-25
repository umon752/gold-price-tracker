import type { TSimplePricePoint } from '~/types/gold'

/**
 * 從 Stooq 抓取 XAU/USD 近30日每日收盤價
 * endpoint: https://stooq.com/q/d/l/?s=xauusd&i=d
 * CSV 格式: Date,Open,High,Low,Close,Volume
 */
export default defineEventHandler(async (): Promise<TSimplePricePoint[]> => {
  try {
    const csv = await $fetch<string>('https://stooq.com/q/d/l/?s=xauusd&i=d', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    const lines = csv.trim().split('\n').filter(l => l && !l.startsWith('Date'))
    const last30 = lines.slice(-30)

    return last30.map((line) => {
      const parts = line.split(',')
      return {
        date: parts[0],                               // YYYY-MM-DD
        price: Math.round(parseFloat(parts[4]) * 100) / 100, // Close
      }
    }).filter(p => p.date && !isNaN(p.price))
  }
  catch (e) {
    console.error('[gold/international-history] 抓取失敗:', e)
    return []
  }
})
