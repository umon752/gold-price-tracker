import type { TGoldPricePoint, TTimeRange } from '~/types/gold'
import { fetchTaiwanBankHistory } from '~/server/utils/taiwanBankGold'

const RANGE_DAYS: Record<TTimeRange, number> = {
  day: 7,
  week: 30,
  month: 90,
  year: 365,
}

// 對應臺灣銀行 search_range 參數
const RANGE_SEARCH: Record<TTimeRange, string> = {
  day: 'ltm',
  week: 'ltm',
  month: 'half',
  year: 'year',
}

export default defineEventHandler(async (event): Promise<TGoldPricePoint[]> => {
  const query = getQuery(event)
  const range = (query.range as TTimeRange) in RANGE_DAYS
    ? (query.range as TTimeRange)
    : 'month'

  const days = RANGE_DAYS[range]
  const liveHistory = await fetchTaiwanBankHistory(RANGE_SEARCH[range])
  if (liveHistory && liveHistory.length > 0) {
    return liveHistory.slice(-days)
  }

  // fallback: 模擬資料
  return generateGoldHistory(days)
})
