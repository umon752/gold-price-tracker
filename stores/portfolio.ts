import type { Auth } from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  type Firestore,
} from 'firebase/firestore'
import type { TTradeRecord } from '~/types/portfolio'
import { calcPortfolioSummary } from '~/utils/calculation'
import { loadTrades, saveTrades } from '~/utils/storage'

export const usePortfolioStore = defineStore('portfolio', () => {
  const trades = ref<TTradeRecord[]>([])
  const loading = ref(false)
  const nuxtApp = useNuxtApp()
  const auth = computed(() => (nuxtApp.$firebaseAuth as Auth | undefined) ?? null)
  const db = computed(() => (nuxtApp.$firestore as Firestore | undefined) ?? null)

  /** 取得目前登入的 user_id。無 Firebase 或未登入時回傳 null */
  async function getUserId(): Promise<string | null> {
    return auth.value?.currentUser?.uid ?? null
  }

  function userTradesCollection(userId: string) {
    return collection(db.value!, 'users', userId, 'trades')
  }

  async function init() {
    loading.value = true
    try {
      const userId = await getUserId()
      if (!userId || !db.value) {
        trades.value = loadTrades()
        return
      }
      const snapshot = await getDocs(query(userTradesCollection(userId), orderBy('date', 'asc')))
      trades.value = snapshot.docs.map((tradeDoc) => ({
        id: tradeDoc.id,
        type: tradeDoc.data().type as 'buy' | 'sell',
        date: tradeDoc.data().date as string,
        grams: Number(tradeDoc.data().grams),
        pricePerGram: Number(tradeDoc.data().pricePerGram),
        note: tradeDoc.data().note as string | undefined,
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
    if (!userId || !db.value) {
      const newTrade: TTradeRecord = { ...trade, id: Date.now().toString() }
      trades.value = [...trades.value, newTrade].sort((a, b) => a.date.localeCompare(b.date))
      saveTrades(trades.value)
      return
    }
    const tradeRef = await addDoc(userTradesCollection(userId), {
      type: trade.type,
      date: trade.date,
      grams: trade.grams,
      pricePerGram: trade.pricePerGram,
      note: trade.note ?? null,
      createdAt: new Date().toISOString(),
    })
    const newTrade: TTradeRecord = {
      ...trade,
      id: tradeRef.id,
    }
    trades.value = [...trades.value, newTrade].sort((a, b) => a.date.localeCompare(b.date))
  }

  async function importTrades(records: TTradeRecord[]): Promise<{ inserted: number; skipped: number }> {
    const existingKeys = new Set(trades.value.map(tradeKey))
    const candidates = records.filter((record) => !existingKeys.has(tradeKey(record)))
    if (!candidates.length) return { inserted: 0, skipped: records.length }

    const userId = await getUserId()
    if (!userId || !db.value) {
      const next = [...trades.value, ...candidates].sort((a, b) => a.date.localeCompare(b.date))
      trades.value = next
      saveTrades(next)
      return { inserted: candidates.length, skipped: records.length - candidates.length }
    }

    const insertedRecords = await Promise.all(candidates.map(async (record) => {
      const tradeRef = await addDoc(userTradesCollection(userId), {
        type: record.type,
        date: record.date,
        grams: record.grams,
        pricePerGram: record.pricePerGram,
        note: record.note ?? null,
        sourceId: record.id,
        createdAt: new Date().toISOString(),
      })
      return { ...record, id: tradeRef.id }
    }))

    trades.value = [...trades.value, ...insertedRecords].sort((a, b) => a.date.localeCompare(b.date))
    return { inserted: candidates.length, skipped: records.length - candidates.length }
  }

  async function removeTrade(id: string) {
    const userId = await getUserId()
    if (!userId || !db.value) {
      trades.value = trades.value.filter(t => t.id !== id)
      saveTrades(trades.value)
      return
    }
    await deleteDoc(doc(db.value, 'users', userId, 'trades', id))
    trades.value = trades.value.filter(t => t.id !== id)
  }

  /** 登入後將 localStorage 的資料匯入 Firestore（若有資料） */
  async function migrateFromLocalStorage(): Promise<boolean> {
    const localTrades = loadTrades()
    if (!localTrades.length || !db.value) return false
    const userId = await getUserId()
    if (!userId) return false
    // 先確認 Firestore 是否已有資料（避免重複匯入）
    const existing = await getDocs(query(userTradesCollection(userId), limit(1)))
    if (!existing.empty) return false

    await Promise.all(localTrades.map(t => addDoc(userTradesCollection(userId), {
      type: t.type,
      date: t.date,
      grams: t.grams,
      pricePerGram: t.pricePerGram,
      note: t.note ?? null,
      createdAt: new Date().toISOString(),
    })))
    await init()
    return true
  }

  const goldStore = useGoldStore()
  const summary = computed(() =>
    calcPortfolioSummary(trades.value, goldStore.current?.todaySell ?? 0),
  )

  function tradeKey(trade: Pick<TTradeRecord, 'type' | 'date' | 'grams' | 'pricePerGram' | 'note'>) {
    return [
      trade.type,
      trade.date,
      Number(trade.grams),
      Number(trade.pricePerGram),
      trade.note?.trim() ?? '',
    ].join('|')
  }

  return { trades, loading, summary, init, addTrade, importTrades, removeTrade, migrateFromLocalStorage }
})
