import type { TGoldPriceSummary } from '~/types/gold'
import { NON_TRADING_DAYS } from '~/server/utils/goldMockData'
import type { TGoldPricePoint } from '~/types/gold'

/** 判斷某日是否為非交易日（週末 或 國定假日） */
function isNonTradingDay(dateStr: string): boolean {
  if (NON_TRADING_DAYS.has(dateStr)) return true
  const day = new Date(dateStr).getUTCDay() // 0=日, 6=六
  return day === 0 || day === 6
}

/** 從 history 陣列往回找最後一個交易日的 index */
function findLastTradingIndex(history: TGoldPricePoint[], fromIndex: number): number {
  for (let i = fromIndex; i >= 0; i--) {
    if (!isNonTradingDay(history[i].date)) return i
  }
  return fromIndex
}

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

// TODO: 替換為臺灣銀行實際 API（https://rate.bot.com.tw/gold）
export default defineEventHandler(async (): Promise<TGoldPriceSummary> => {
  // 優先使用臺銀即時資料
  const live = await fetchTaiwanBankGold()

  const history = generateGoldHistory(366)

  const todayDateStr = new Date().toISOString().split('T')[0]
  const isTodayNonTrading = isNonTradingDay(todayDateStr)

  // 找出最後一個交易日（含今日）及其前一個交易日
  const lastTradingIdx = findLastTradingIndex(history, history.length - 1)
  const prevTradingIdx = findLastTradingIndex(history, lastTradingIdx - 1)

  let todayBuy: number
  let todaySell: number

  if (live && !isTodayNonTrading) {
    // 今日為交易日且臺銀資料可取：使用即時牌告
    todayBuy = live.buy
    todaySell = live.sell
  }
  else {
    // 非交易日或即時資料無法取得：以最後一個交易日的收盤價為準
    todayBuy = history[lastTradingIdx].buyPrice
    todaySell = history[lastTradingIdx].sellPrice
  }

  const lastTrading = history[lastTradingIdx]
  const prevTrading = history[prevTradingIdx]
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

  // 漲跌以最後交易日 vs 前一交易日計算（非交易日也能正確顯示最後交易日漲跌）
  const change = todayBuy - prevTrading.buyPrice
  const changePercent = (change / prevTrading.buyPrice) * 100
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
    updatedAt: isTodayNonTrading ? lastTrading.date + 'T00:00:00.000Z' : new Date().toISOString(),
  }
})
