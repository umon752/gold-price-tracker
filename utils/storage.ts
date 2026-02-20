import type { TTradeRecord } from '~/types/portfolio'

const STORAGE_KEY = 'gpt_trades'

export function loadTrades(): TTradeRecord[] {
  if (import.meta.server) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TTradeRecord[]) : []
  } catch {
    return []
  }
}

export function saveTrades(trades: TTradeRecord[]): void {
  if (import.meta.server) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades))
}
