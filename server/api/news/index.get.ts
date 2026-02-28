import type { TNewsItem } from '~/types/news'

type TNewsApiArticle = { title: string; description: string; url: string; urlToImage?: string; publishedAt: string; source: { name: string } }
type TNewsApiRes = { articles: TNewsApiArticle[] }

// TODO: 若有 NEWS_API_KEY，可替換為 newsapi.org 實際呼叫
export default defineEventHandler(async (event): Promise<TNewsItem[]> => {
  const { newsApiKey } = useRuntimeConfig(event)

  if (newsApiKey) {
    try {
      const goldParams = {
        q: '(gold price OR XAU/USD OR gold futures OR gold ETF OR COMEX gold OR 黃金價格 OR 黃金走勢 OR 金價) AND (price OR market OR Fed OR inflation OR war OR conflict OR geopolitical OR sanctions OR 通膨 OR 聯準會 OR 美元 OR 戰爭 OR 地緣政治 OR 制裁)',
        sortBy: 'publishedAt',
        apiKey: newsApiKey,
      }
      // 獨立抓取地緣政治衝突新聞（不要求同時提到金價）
      const geoParams = {
        q: 'war OR conflict OR military OR invasion OR ceasefire OR 戰爭 OR 衝突 OR 軍事 OR 停火 OR 入侵',
        sortBy: 'publishedAt',
        apiKey: newsApiKey,
      }

      const [goldZhRes, goldEnRes, geoEnRes] = await Promise.all([
        $fetch<TNewsApiRes>('https://newsapi.org/v2/everything', { params: { ...goldParams, language: 'zh', pageSize: 8 } }).catch(() => ({ articles: [] })),
        $fetch<TNewsApiRes>('https://newsapi.org/v2/everything', { params: { ...goldParams, language: 'en', pageSize: 8 } }).catch(() => ({ articles: [] })),
        $fetch<TNewsApiRes>('https://newsapi.org/v2/everything', { params: { ...geoParams, language: 'en', pageSize: 5 } }).catch(() => ({ articles: [] })),
      ])

      const goldArticles = [...goldZhRes.articles, ...goldEnRes.articles.slice(0, Math.max(0, 8 - goldZhRes.articles.length))]
      const seenUrls = new Set(goldArticles.map(a => a.url))
      const geoArticles = geoEnRes.articles.filter(a => !seenUrls.has(a.url))
      const articles = [...goldArticles, ...geoArticles]

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
