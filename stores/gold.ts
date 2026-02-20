import type { TGoldPriceSummary, TGoldPricePoint, TTimeRange } from '~/types/gold'
import { fetchCurrentGoldPrice, fetchGoldHistory } from '~/services/gold'

export const useGoldStore = defineStore('gold', () => {
  const current = ref<TGoldPriceSummary | null>(null)
  const history = ref<TGoldPricePoint[]>([])
  const selectedRange = ref<TTimeRange>('month')
  const loadingCurrent = ref(false)
  const loadingHistory = ref(false)
  const error = ref<string | null>(null)

  async function fetchCurrent() {
    loadingCurrent.value = true
    error.value = null
    try {
      current.value = await fetchCurrentGoldPrice()
    }
    catch {
      error.value = '無法取得目前金價'
    }
    finally {
      loadingCurrent.value = false
    }
  }

  async function fetchHistory(range?: TTimeRange) {
    if (range) selectedRange.value = range
    loadingHistory.value = true
    try {
      history.value = await fetchGoldHistory(selectedRange.value)
    }
    catch {
      error.value = '無法取得歷史資料'
    }
    finally {
      loadingHistory.value = false
    }
  }

  return {
    current,
    history,
    selectedRange,
    loadingCurrent,
    loadingHistory,
    error,
    fetchCurrent,
    fetchHistory,
  }
})
