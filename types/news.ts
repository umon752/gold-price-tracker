export type TNewsItem = {
  id: string
  title: string
  summary: string
  source: string
  publishedAt: string
  url: string
  imageUrl?: string
  sentiment?: 'positive' | 'negative' | 'neutral'
}
