// POST /api/ai/news-sentiment
// Body: { articles: { title, summary }[] }
export default defineEventHandler(async (event) => {
  const { geminiApiKey } = useRuntimeConfig(event)
  if (!geminiApiKey) throw createError({ statusCode: 503, message: 'AI 功能未設定' })

  const { articles } = await readBody(event)
  if (!articles?.length) throw createError({ statusCode: 400, message: '無新聞資料' })

  const list = articles.map((a: { title: string; summary: string }, i: number) =>
    `${i + 1}. 標題：${a.title}\n   摘要：${a.summary ?? ''}`
  ).join('\n\n')

  const prompt = `你是黃金市場分析師。以下是${articles.length}則新聞，請判斷每則新聞對黃金價格的影響。

${list}

請只輸出 JSON 陣列，格式為：
[{"index":1,"sentiment":"bullish"},{"index":2,"sentiment":"neutral"},...]

sentiment 只能是以下三種值之一：
- "bullish"（利多：預期金價上漲）
- "bearish"（利空：預期金價下跌）  
- "neutral"（中立：影響不明確）

只輸出 JSON，不要其他文字。`

  const raw = await callGemini(prompt, geminiApiKey)
  // 擷取 JSON 部分
  const match = raw.match(/\[[\s\S]*\]/)
  if (!match) return articles.map((_: unknown, i: number) => ({ index: i + 1, sentiment: 'neutral' }))
  return JSON.parse(match[0])
})
