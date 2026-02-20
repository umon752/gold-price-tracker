// POST /api/ai/trade-analysis
// Body: { trades: TTradeRecord[], currentPrice: number }
export default defineEventHandler(async (event) => {
  const { geminiApiKey } = useRuntimeConfig(event)
  if (!geminiApiKey) throw createError({ statusCode: 503, message: 'AI 功能未設定' })

  const { trades, currentPrice } = await readBody(event)

  if (!trades?.length) throw createError({ statusCode: 400, message: '無交易資料' })

  const lines = trades.map((t: { type: string; date: string; grams: number; pricePerGram: number }) =>
    `${t.date} ${t.type === 'buy' ? '買入' : '賣出'} ${t.grams}克 @ ${t.pricePerGram}元/克`
  ).join('\n')

  const totalGrams = trades.filter((t: { type: string }) => t.type === 'buy').reduce((s: number, t: { grams: number }) => s + t.grams, 0)
    - trades.filter((t: { type: string }) => t.type === 'sell').reduce((s: number, t: { grams: number }) => s + t.grams, 0)
  const totalCost = trades.filter((t: { type: string }) => t.type === 'buy').reduce((s: number, t: { grams: number; pricePerGram: number }) => s + t.grams * t.pricePerGram, 0)
  const avgCost = totalGrams > 0 ? Math.round(totalCost / totalGrams) : 0

  const prompt = `你是黃金投資分析師。以下是一位投資人的黃金交易記錄：

${lines}

目前持有：${totalGrams}克，平均成本：${avgCost}元/克，現價：${currentPrice}元/克

請用繁體中文，簡潔地（150字以內）分析：
1. 買入時機評估（相對於市場）
2. 目前損益狀況簡評
3. 一句話持倉建議

請直接輸出分析內容，不要分點編號，用自然段落。`

  const text = await callGemini(prompt, geminiApiKey)
  return { analysis: text }
})
