// POST /api/ai/suggestion
// Body: { totalGrams, avgCost, currentPrice, pnlRate }
export default defineEventHandler(async (event) => {
  const { geminiApiKey } = useRuntimeConfig(event)
  if (!geminiApiKey) throw createError({ statusCode: 503, message: 'AI 功能未設定' })

  const { totalGrams, avgCost, currentPrice, pnlRate } = await readBody(event)

  const prompt = `你是黃金投資顧問。投資人目前狀況：
- 持有：${totalGrams}克
- 平均成本：${avgCost}元/克
- 現價：${currentPrice}元/克
- 損益率：${pnlRate > 0 ? '+' : ''}${pnlRate.toFixed(2)}%

請用繁體中文，用1~2句話給出具體的操作參考建議（持有/加碼/分批出場），語氣要像專業顧問，結尾加一句風險提示。不超過80字。`

  const text = await callGemini(prompt, geminiApiKey)
  return { suggestion: text }
})
