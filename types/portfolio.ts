export type TTradeRecord = {
  id: string
  type: 'buy' | 'sell'
  date: string        // YYYY-MM-DD
  grams: number       // 克數
  pricePerGram: number // 單價（元/克）
  note?: string
}

export type TPortfolioSummary = {
  totalGrams: number          // 目前持有總克數
  avgCostPerGram: number      // 平均買入成本
  totalCost: number           // 總買入成本
  currentValue: number        // 目前市值
  unrealizedPnL: number       // 未實現損益
  unrealizedPnLPercent: number
  realizedPnL: number         // 已實現損益
}
