// POST /api/ai/daily-brief
// Body: { articles: { title, summary }[], currentPrice, priceChange }
export default defineEventHandler(async (event) => {
  const { geminiApiKey } = useRuntimeConfig(event)
  if (!geminiApiKey) throw createError({ statusCode: 503, message: 'AI 功能未設定' })

  const { articles, currentPrice, priceChange } = await readBody(event)
  if (!articles?.length) throw createError({ statusCode: 400, message: '無新聞資料' })

  const headlines = articles.slice(0, 8).map((a: { title: string }) => `• ${a.title}`).join('\n')

  const prompt = `你是財經記者。今日黃金現價 ${currentPrice} 元/克，漲跌 ${priceChange > 0 ? '+' : ''}${priceChange} 元。

今日相關新聞：
${headlines}

請用繁體中文寫一段「今日金市簡報」，100字以內，重點說明今日金價走勢與主要影響因素，語氣專業簡潔。直接輸出內容，不要標題。`

  const text = await callGemini(prompt, geminiApiKey)
  return { brief: text }
})
