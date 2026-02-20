import type { TGoldPriceSummary, TGoldPricePoint, TTimeRange } from '~/types/gold'

export async function fetchCurrentGoldPrice(): Promise<TGoldPriceSummary> {
  return $fetch<TGoldPriceSummary>('/api/gold/current')
}

export async function fetchGoldHistory(range: TTimeRange): Promise<TGoldPricePoint[]> {
  return $fetch<TGoldPricePoint[]>('/api/gold/history', { params: { range } })
}
