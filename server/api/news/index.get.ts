import type { TNewsItem } from '~/types/news'

type TNewsApiArticle = { title: string; description: string; url: string; urlToImage?: string; publishedAt: string; source: { name: string } }
type TNewsApiRes = { articles: TNewsApiArticle[] }

// TODO: 若有 NEWS_API_KEY，可替換為 newsapi.org 實際呼叫
export default defineEventHandler(async (event): Promise<TNewsItem[]> => {
  const { newsApiKey } = useRuntimeConfig(event)

  if (newsApiKey) {
    try {
      const baseParams = {
        q: '(gold price OR XAU/USD OR gold futures OR gold ETF OR COMEX gold OR 黃金價格 OR 黃金走勢 OR 金價) AND (price OR market OR Fed OR inflation OR 通膨 OR 聯準會 OR 美元)',
        sortBy: 'publishedAt',
        apiKey: newsApiKey,
      }

      // 中文優先，不足的用英文補足
      const [zhRes, enRes] = await Promise.all([
        $fetch<TNewsApiRes>('https://newsapi.org/v2/everything', { params: { ...baseParams, language: 'zh', pageSize: 10 } }).catch(() => ({ articles: [] })),
        $fetch<TNewsApiRes>('https://newsapi.org/v2/everything', { params: { ...baseParams, language: 'en', pageSize: 10 } }).catch(() => ({ articles: [] })),
      ])

      const zhArticles = zhRes.articles
      const enArticles = enRes.articles.slice(0, Math.max(0, 10 - zhArticles.length))
      const articles = [...zhArticles, ...enArticles]

      if (articles.length > 0) {
        return articles.map((a, i) => ({
          id: String(i + 1),
          title: a.title,
          summary: a.description ?? '',
          source: a.source.name,
          publishedAt: a.publishedAt,
          url: a.url,
          imageUrl: a.urlToImage,
          sentiment: 'neutral' as const,
        }))
      }
    } catch {
      // 失敗時 fallback 至 mock 資料
    }
  }

  return getMockNews()
})
