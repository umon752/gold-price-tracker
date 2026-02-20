import type { TTradeRecord } from '~/types/portfolio'
import { calcPortfolioSummary } from '~/utils/calculation'
import { loadTrades, saveTrades } from '~/utils/storage'

export const usePortfolioStore = defineStore('portfolio', () => {
  const trades = ref<TTradeRecord[]>([])

  function init() {
    trades.value = loadTrades()
  }

  function addTrade(trade: Omit<TTradeRecord, 'id'>) {
    const newTrade: TTradeRecord = { ...trade, id: Date.now().toString() }
    trades.value = [...trades.value, newTrade].sort((a, b) => a.date.localeCompare(b.date))
    saveTrades(trades.value)
  }

  function removeTrade(id: string) {
    trades.value = trades.value.filter(t => t.id !== id)
    saveTrades(trades.value)
  }

  const goldStore = useGoldStore()

  const summary = computed(() =>
    calcPortfolioSummary(trades.value, goldStore.current?.todaySell ?? 0),
  )

  return { trades, summary, init, addTrade, removeTrade }
})
