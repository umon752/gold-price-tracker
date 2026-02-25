import type { TGoldPriceSummary, TGoldPricePoint, TTimeRange, TInternationalGoldPrice, TXAUtPrice, TSimplePricePoint } from '~/types/gold'
import { fetchCurrentGoldPrice, fetchGoldHistory } from '~/services/gold'

export const useGoldStore = defineStore('gold', () => {
  const current = ref<TGoldPriceSummary | null>(null)
  const history = ref<TGoldPricePoint[]>([])
  const international = ref<TInternationalGoldPrice | null>(null)
  const selectedRange = ref<TTimeRange>('month')
  const loadingCurrent = ref(false)
  const loadingHistory = ref(false)
  const loadingInternational = ref(false)
  const xaut = ref<TXAUtPrice | null>(null)
  const loadingXaut = ref(false)
  const internationalHistory = ref<TSimplePricePoint[]>([])
  const xautHistory = ref<TSimplePricePoint[]>([])
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

  async function fetchXaut() {
    loadingXaut.value = true
    try {
      xaut.value = await $fetch<TXAUtPrice>('/api/gold/xaut')
    }
    catch {
      error.value = '無法取得 XAUt 金價'
    }
    finally {
      loadingXaut.value = false
    }
  }

  async function fetchInternationalHistory() {
    try {
      internationalHistory.value = await $fetch<TSimplePricePoint[]>('/api/gold/international-history')
    }
    catch {
      console.error('無法取得國際金價歷史')
    }
  }

  async function fetchXautHistory() {
    try {
      xautHistory.value = await $fetch<TSimplePricePoint[]>('/api/gold/xaut-history')
    }
    catch {
      console.error('無法取得 XAUt 歷史')
    }
  }

  return {
    current,
    history,
    international,
    xaut,
    internationalHistory,
    xautHistory,
    selectedRange,
    loadingCurrent,
    loadingHistory,
    loadingInternational,
    loadingXaut,
    error,
    fetchCurrent,
    fetchHistory,
    fetchInternational,
    fetchXaut,
    fetchInternationalHistory,
    fetchXautHistory,
  }
})
