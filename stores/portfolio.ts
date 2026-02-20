import type { TTradeRecord } from '~/types/portfolio'
import { calcPortfolioSummary } from '~/utils/calculation'
import { loadTrades, saveTrades } from '~/utils/storage'

export const usePortfolioStore = defineStore('portfolio', () => {
  const trades = ref<TTradeRecord[]>([])
  const loading = ref(false)
  const nuxtApp = useNuxtApp()
  const db = computed(() => (nuxtApp.$supabase as ReturnType<typeof import('@supabase/supabase-js').createClient> | undefined) ?? null)

  /** 取得目前登入的 user_id（需 auth store 已初始化）。無 Supabase 或未登入時回傳 null */
  async function getUserId(): Promise<string | null> {
    if (!db.value) return null
    const { data: { session } } = await db.value.auth.getSession()
    return session?.user?.id ?? null
  }

  async function init() {
    loading.value = true
    try {
      const userId = await getUserId()
      if (!userId) {
        trades.value = loadTrades()
        return
      }
      const { data, error } = await db.value!
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
      trades.value = loadTrades()
    } finally {
      loading.value = false
    }
  }

  async function addTrade(trade: Omit<TTradeRecord, 'id'>) {
    const userId = await getUserId()
    if (!userId) {
      const newTrade: TTradeRecord = { ...trade, id: Date.now().toString() }
      trades.value = [...trades.value, newTrade].sort((a, b) => a.date.localeCompare(b.date))
      saveTrades(trades.value)
      return
    }
    const { data, error } = await db.value!
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
    if (!db.value) {
      trades.value = trades.value.filter(t => t.id !== id)
      saveTrades(trades.value)
      return
    }
    const { error } = await db.value.from('trades').delete().eq('id', id)
    if (error) { console.error('[portfolio] 刪除失敗', error); return }
    trades.value = trades.value.filter(t => t.id !== id)
  }

  /** 登入後將 localStorage 的資料匯入 Supabase（若有資料） */
  async function migrateFromLocalStorage(): Promise<boolean> {
    const localTrades = loadTrades()
    if (!localTrades.length || !db.value) return false
    const userId = await getUserId()
    if (!userId) return false
    // 先確認 Supabase 是否已有資料（避免重複匯入）
    const { data: existing } = await db.value.from('trades').select('id').eq('user_id', userId).limit(1)
    if (existing && existing.length > 0) return false
    const rows = localTrades.map(t => ({
      user_id: userId,
      type: t.type,
      date: t.date,
      grams: t.grams,
      price_per_gram: t.pricePerGram,
      note: t.note ?? null,
    }))
    const { error } = await db.value.from('trades').insert(rows)
    if (error) { console.error('[portfolio] 匯入失敗', error); return false }
    await init()
    return true
  }

  const goldStore = useGoldStore()
  const summary = computed(() =>
    calcPortfolioSummary(trades.value, goldStore.current?.todaySell ?? 0),
  )

  return { trades, loading, summary, init, addTrade, removeTrade, migrateFromLocalStorage }
})

