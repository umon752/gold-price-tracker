import type { TSimplePricePoint } from '~/types/gold'

/**
 * 從 CoinGecko 抓取 XAUt 近30日每日價格
 * endpoint: https://api.coingecko.com/api/v3/coins/tether-gold/market_chart?vs_currency=usd&days=30&interval=daily
 */
export default defineEventHandler(async (): Promise<TSimplePricePoint[]> => {
  try {
    const data = await $fetch<{ prices: [number, number][] }>(
      'https://api.coingecko.com/api/v3/coins/tether-gold/market_chart?vs_currency=usd&days=30&interval=daily',
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    )

    return data.prices.map(([ts, price]) => ({
      date: new Date(ts).toISOString().split('T')[0],
      price: Math.round(price * 100) / 100,
    }))
  }
  catch (e) {
    console.error('[gold/xaut-history] 抓取失敗:', e)
    return []
  }
})
