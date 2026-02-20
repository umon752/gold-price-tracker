import type { TNewsItem } from '~/types/news'

// TODO: 若有 NEWS_API_KEY，可替換為 newsapi.org 實際呼叫
export default defineEventHandler(async (event): Promise<TNewsItem[]> => {
  const { newsApiKey } = useRuntimeConfig(event)

  if (newsApiKey) {
    try {
      const res = await $fetch<{ articles: Array<{ title: string; description: string; url: string; urlToImage?: string; publishedAt: string; source: { name: string } }> }>(
        'https://newsapi.org/v2/everything',
        {
          params: {
            q: 'gold price 黃金',
            language: 'zh',
            sortBy: 'publishedAt',
            pageSize: 10,
            apiKey: newsApiKey,
          },
        },
      )
      return res.articles.map((a, i) => ({
        id: String(i + 1),
        title: a.title,
        summary: a.description ?? '',
        source: a.source.name,
        publishedAt: a.publishedAt,
        url: a.url,
        imageUrl: a.urlToImage,
        sentiment: 'neutral' as const,
      }))
    } catch {
      // 失敗時 fallback 至 mock 資料
    }
  }

  return getMockNews()
})
