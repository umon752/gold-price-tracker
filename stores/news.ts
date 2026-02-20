import type { TNewsItem } from '~/types/news'
import { fetchNews } from '~/services/news'

export const useNewsStore = defineStore('news', () => {
  const items = ref<TNewsItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      items.value = await fetchNews()
    }
    catch {
      error.value = '無法取得新聞資料'
    }
    finally {
      loading.value = false
    }
  }

  return { items, loading, error, fetch }
})
