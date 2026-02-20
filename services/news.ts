import type { TNewsItem } from '~/types/news'

export async function fetchNews(): Promise<TNewsItem[]> {
  return $fetch<TNewsItem[]>('/api/news')
}
