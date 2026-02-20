import type { TTradeRecord, TPortfolioSummary } from '~/types/portfolio'

/**
 * 根據交易記錄與當前金價計算損益摘要
 * 所有金額以整數「分」為單位計算後轉回元，避免浮點數誤差
 */
export function calcPortfolioSummary(
  trades: TTradeRecord[],
  currentSellPrice: number,
): TPortfolioSummary {
  let totalBuyCostCents = 0      // 買入總成本（分）
  let totalBuyGrams100 = 0       // 買入總克數 × 100
  let realizedPnLCents = 0       // 已實現損益（分）
  let holdingGrams100 = 0        // 目前持有克數 × 100

  const buyQueue: { grams100: number; priceCents: number }[] = []

  for (const t of trades) {
    const grams100 = Math.round(t.grams * 100)
    const priceCents = Math.round(t.pricePerGram * 100)

    if (t.type === 'buy') {
      buyQueue.push({ grams100, priceCents })
      totalBuyCostCents += grams100 * priceCents
      totalBuyGrams100 += grams100
      holdingGrams100 += grams100
    } else {
      // FIFO 賣出
      let sellGrams100 = grams100
      holdingGrams100 -= grams100
      while (sellGrams100 > 0 && buyQueue.length > 0) {
        const head = buyQueue[0]
        const consumed = Math.min(head.grams100, sellGrams100)
        realizedPnLCents += consumed * (priceCents - head.priceCents)
        head.grams100 -= consumed
        sellGrams100 -= consumed
        if (head.grams100 === 0) buyQueue.shift()
      }
    }
  }

  const holdingGrams = holdingGrams100 / 100
  const avgCostPerGram = totalBuyGrams100 > 0
    ? totalBuyCostCents / totalBuyGrams100 / 100
    : 0
  const totalCost = holdingGrams * avgCostPerGram
  const currentValue = holdingGrams * currentSellPrice
  const unrealizedPnL = currentValue - totalCost
  const unrealizedPnLPercent = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0

  return {
    totalGrams: holdingGrams,
    avgCostPerGram,
    totalCost,
    currentValue,
    unrealizedPnL,
    unrealizedPnLPercent,
    realizedPnL: realizedPnLCents / 10000,
  }
}
