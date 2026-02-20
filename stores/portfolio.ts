import type { TTradeRecord } from '~/types/portfolio'
import { calcPortfolioSummary } from '~/utils/calculation'

export const usePortfolioStore = defineStore('portfolio', () => {
  const trades = ref<TTradeRecord[]>([])
  const loading = ref(false)
  const { $supabase } = useNuxtApp()

  /** 確保匿名登入，回傳 user_id */
  async function ensureUser(): Promise<string | null> {
    const { data: { session } } = await $supabase.auth.getSession()
    if (session?.user) return session.user.id
    const { data, error } = await $supabase.auth.signInAnonymously()
    if (error) { console.error('[portfolio] 匿名登入失敗', error); return null }
    return data.user?.id ?? null
  }

  async function init() {
    loading.value = true
    try {
      const userId = await ensureUser()
      if (!userId) return
      const { data, error } = await $supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true })
      if (error) throw error
      trades.value = (data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        type: r.type as 'buy' | 'sell',
        date: r.date as string,
        grams: Number(r.grams),
        pricePerGram: Number(r.price_per_gram),
        note: r.note as string | undefined,
      }))
    } catch (e) {
      console.error('[portfolio] 載入交易記錄失敗', e)
    } finally {
      loading.value = false
    }
  }

  async function addTrade(trade: Omit<TTradeRecord, 'id'>) {
    const userId = await ensureUser()
    if (!userId) return
    const { data, error } = await $supabase
      .from('trades')
      .insert({
        user_id: userId,
        type: trade.type,
        date: trade.date,
        grams: trade.grams,
        price_per_gram: trade.pricePerGram,
        note: trade.note ?? null,
      })
      .select()
      .single()
    if (error) { console.error('[portfolio] 新增失敗', error); return }
    const newTrade: TTradeRecord = {
      id: data.id,
      type: data.type,
      date: data.date,
      grams: Number(data.grams),
      pricePerGram: Number(data.price_per_gram),
      note: data.note ?? undefined,
    }
    trades.value = [...trades.value, newTrade].sort((a, b) => a.date.localeCompare(b.date))
  }

  async function removeTrade(id: string) {
    const { error } = await $supabase.from('trades').delete().eq('id', id)
    if (error) { console.error('[portfolio] 刪除失敗', error); return }
    trades.value = trades.value.filter(t => t.id !== id)
  }

  const goldStore = useGoldStore()
  const summary = computed(() =>
    calcPortfolioSummary(trades.value, goldStore.current?.todaySell ?? 0),
  )

  return { trades, loading, summary, init, addTrade, removeTrade }
})

