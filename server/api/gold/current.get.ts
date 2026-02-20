import type { TGoldPriceSummary } from '~/types/gold'
import { NON_TRADING_DAYS } from '~/server/utils/goldMockData'

type TTaiwanBankGold = { buy: number; sell: number } | null

/**
 * 從臺灣銀行 rate.bot.com.tw/gold 抓取黃金存摺即時牌告價
 * 本行買進 = 客戶賣出時收到的價格（buyPrice）
 * 本行賣出 = 客戶買入時支付的價格（sellPrice）
 */
async function fetchTaiwanBankGold(): Promise<TTaiwanBankGold> {
  try {
    const html = await $fetch<string>('https://rate.bot.com.tw/gold', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-TW,zh;q=0.9',
        'Referer': 'https://rate.bot.com.tw/',
      },
    })

    // 臺銀頁面的金價放在 <td class="text-right ebank"> 內
    // 黃金存摺區：第一個為本行賣出，第二個為本行買進
    const priceMatches = [...html.matchAll(/<td[^>]+text-right\s+ebank[^>]*>\s*(\d{4,5})\s*/g)]

    if (priceMatches.length < 2) return null

    const sell = parseInt(priceMatches[0][1]) // 本行賣出（較高）
    const buy = parseInt(priceMatches[1][1])  // 本行買進（較低）

    if (!sell || !buy || sell <= buy) return null

    return { buy, sell }
  }
  catch {
    return null
  }
}

// TODO: 替換為台灣銀行實際 API（https://rate.bot.com.tw/gold）
export default defineEventHandler(async (): Promise<TGoldPriceSummary> => {
  // 優先使用臺銀即時資料
  const live = await fetchTaiwanBankGold()

  const history = generateGoldHistory(366)

  let todayBuy: number
  let todaySell: number

  const todayDateStr = new Date().toISOString().split('T')[0]
  const isTodayNonTrading = NON_TRADING_DAYS.has(todayDateStr)

  if (live && !isTodayNonTrading) {
    todayBuy = live.buy
    todaySell = live.sell
  }
  else {
    // fallback：使用 mock 資料最後一筆
    const today = history[history.length - 1]
    todayBuy = today.buyPrice
    todaySell = today.sellPrice
  }

  const yesterday = history[history.length - 2]
  const weekAgo = history[history.length - 8] ?? history[0]

  // 近1月平均：取最近 30 天（不含今日）的買入價平均值
  const monthSlice = history.slice(-31, -1)
  const monthAvgBuy = monthSlice.reduce((sum, p) => sum + p.buyPrice, 0) / monthSlice.length

  // 近3月平均：取最近 90 天（不含今日）的買入價平均值
  const threeMonthSlice = history.slice(-91, -1)
  const threeMonthAvgBuy = threeMonthSlice.reduce((sum, p) => sum + p.buyPrice, 0) / threeMonthSlice.length

  // 近1年平均：取最近 365 天（不含今日）的買入價平均值
  const yearSlice = history.slice(-366, -1)
  const yearAvgBuy = yearSlice.reduce((sum, p) => sum + p.buyPrice, 0) / yearSlice.length

  // 休市日漲跌為 0；否則以今日買入價 vs 昨日買入價計算
  const change = isTodayNonTrading ? 0 : todayBuy - yesterday.buyPrice
  const changePercent = isTodayNonTrading ? 0 : (change / yesterday.buyPrice) * 100
  const weekChange = todayBuy - weekAgo.buyPrice
  const monthChange = todayBuy - monthAvgBuy
  const threeMonthChange = todayBuy - threeMonthAvgBuy
  const yearChange = todayBuy - yearAvgBuy

  return {
    todayBuy,
    todaySell,
    change,
    changePercent,
    weekChange,
    monthChange,
    threeMonthChange,
    yearChange,
    updatedAt: new Date().toISOString(),
  }
})
