import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

dayjs.extend(utc)
dayjs.extend(timezone)

const TZ = 'Asia/Taipei'

/** 格式化金額（含千分位） */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/** 格式化漲跌幅百分比 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

/** 格式化克數 */
export function formatGrams(value: number): string {
  return `${value.toFixed(2)} 克`
}

/** 格式化台灣時區日期 */
export function formatDate(date: string | Date, format = 'YYYY/MM/DD'): string {
  return dayjs(date).tz(TZ).format(format)
}
