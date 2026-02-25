import type { TXAUtPrice } from '~/types/gold'

/**
 * 從 CoinGecko 抓取 XAUt (Tether Gold) 即時報價
 * https://www.coingecko.com/api/documentations/v3
 */
export default defineEventHandler(async (): Promise<TXAUtPrice> => {
  try {
    const data = await $fetch<{
      'tether-gold': {
        usd: number
        usd_24h_change: number
        last_updated_at: number
      }
    }>(
      'https://api.coingecko.com/api/v3/simple/price?ids=tether-gold&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true',
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    )

    const xaut = data['tether-gold']
    return {
      priceUSD: Math.round(xaut.usd * 100) / 100,
      change24h: Math.round(xaut.usd_24h_change * 100) / 100,
      updatedAt: new Date(xaut.last_updated_at * 1000).toISOString(),
    }
  }
  catch (e) {
    console.error('[gold/xaut] 抓取 CoinGecko 失敗:', e)
    return { priceUSD: 0, change24h: 0, updatedAt: new Date().toISOString() }
  }
})
