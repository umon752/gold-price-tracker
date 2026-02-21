import type { TGoldPriceSummary, TGoldPricePoint, TTimeRange, TInternationalGoldPrice } from '~/types/gold'
import { fetchCurrentGoldPrice, fetchGoldHistory } from '~/services/gold'

export const useGoldStore = defineStore('gold', () => {
  const current = ref<TGoldPriceSummary | null>(null)
  const history = ref<TGoldPricePoint[]>([])
  const international = ref<TInternationalGoldPrice | null>(null)
  const selectedRange = ref<TTimeRange>('month')
  const loadingCurrent = ref(false)
  const loadingHistory = ref(false)
  const loadingInternational = ref(false)
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

  async function fetchInternational() {
    loadingInternational.value = true
    try {
      international.value = await $fetch<TInternationalGoldPrice>('/api/gold/international')
    }
    catch {
      error.value = '無法取得國際金價'
    }
    finally {
      loadingInternational.value = false
    }
  }

  return {
    current,
    history,
    international,
    selectedRange,
    loadingCurrent,
    loadingHistory,
    loadingInternational,
    error,
    fetchCurrent,
    fetchHistory,
    fetchInternational,
  }
})
