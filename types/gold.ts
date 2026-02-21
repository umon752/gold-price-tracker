export type TTimeRange = 'day' | 'week' | 'month' | 'year'

export type TGoldPricePoint = {
  date: string        // ISO 日期字串 YYYY-MM-DD
  buyPrice: number    // 黃金存摺買入價（台銀收購，元/克）
  sellPrice: number   // 黃金存摺賣出價（台銀售出，元/克）
}

export type TInternationalGoldPrice = {
  priceUSD: number      // 現貨價格（USD / troy oz）
  priceUSDPerGram: number // 每克美元價格
  change: number        // 24h 漲跌（USD）
  changePercent: number // 24h 漲跌幅（%）
  updatedAt: string
}

export type TGoldPriceSummary = {
  todayBuy: number    // 今日存摺買入價
  todaySell: number   // 今日存摺賣出價
  change: number        // 今日漲跌（元）
  changePercent: number // 今日漲跌幅（%）
  weekChange: number       // 近7天漲跌
  monthChange: number      // 近1月漲跌
  threeMonthChange: number // 近3月漲跌
  yearChange: number       // 近1年漲跌
  updatedAt: string
}
