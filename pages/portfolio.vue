<template>
  <div class="space-y-6">
    <h1 class="font-display text-3xl font-semibold" style="color: var(--text)">損益</h1>

    <!-- P&L 摘要卡片 -->
    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <div
        v-for="card in summaryCards"
        :key="card.label"
        class="rounded-2xl p-4"
        style="background: var(--surface); border: 1px solid var(--border)"
      >
        <p class="stat-label mb-1">{{ card.label }}</p>
        <p class="price-value text-xl font-bold" :style="`color: ${card.color}`">{{ card.value }}</p>
        <p v-if="card.sub" class="text-xs mt-1" :style="`color: ${card.subColor ?? 'var(--text-2)'}`">{{ card.sub }}</p>
      </div>
    </div>

    <!-- 快速試算 -->
    <div class="rounded-2xl p-5" style="background: var(--surface); border: 1px solid var(--border)">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-semibold" style="color: var(--text)">快速試算 / 匯入庫存</h2>
        <p class="text-xs" style="color: var(--text-3)">輸入目前持有克數與總投資金額，可直接匯入為一筆記錄</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label class="stat-label block mb-1">庫存克數（克）</label>
          <input
            v-model.number="calc.grams"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            class="w-full rounded-lg px-3 py-2 text-sm focus:outline-none price-value"
            style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
          />
        </div>
        <div>
          <label class="stat-label block mb-1">投資金額 A（元）</label>
          <input
            v-model.number="calc.cost"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            class="w-full rounded-lg px-3 py-2 text-sm focus:outline-none price-value"
            style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
          />
        </div>
      </div>

      <!-- 試算結果 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div>
          <p class="stat-label mb-1">平均成本</p>
          <p class="price-value text-lg font-medium" style="color: var(--text)">{{ calcResult.avgCost }}</p>
          <p class="stat-label mt-0.5">元 / 克</p>
        </div>
        <div>
          <p class="stat-label mb-1">市值 B</p>
          <p class="price-value text-lg font-medium" style="color: var(--text)">{{ calcResult.marketValue }}</p>
          <p class="stat-label mt-0.5">元</p>
        </div>
        <div>
          <p class="stat-label mb-1">預估損益（B − A）</p>
          <p class="price-value text-lg font-medium" :style="calcResult.pnlColor">{{ calcResult.pnl }}</p>
          <p class="stat-label mt-0.5">元</p>
        </div>
        <div>
          <p class="stat-label mb-1">預估損益率</p>
          <p class="price-value text-lg font-medium" :style="calcResult.pnlColor">{{ calcResult.pnlRate }}</p>
        </div>
      </div>

      <!-- 匯入按鈕 -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style="background: var(--gold); color: white"
          @click="importHoldings"
        >
          匯入為交易記錄
        </button>
        <p v-if="calcImportMsg" class="text-xs" :style="calcImportMsgColor">{{ calcImportMsg }}</p>
      </div>
    </div>

    <!-- 新增交易 -->
    <div class="rounded-2xl p-5" style="background: var(--surface); border: 1px solid var(--border)">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-semibold" style="color: var(--text)">新增交易</h2>
      </div>

      <form class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end" @submit.prevent="submitTrade">
        <!-- 買入/賣出 -->
        <div>
          <label class="stat-label block mb-1">類型</label>
          <div class="flex rounded-lg overflow-hidden" style="border: 1px solid var(--border)">
            <button
              type="button"
              class="flex-1 py-2 text-sm font-medium transition-colors"
              :style="form.type === 'buy' ? 'background: var(--up); color: white' : 'background: var(--surface-2); color: var(--text-2)'"
              @click="form.type = 'buy'"
            >
              買入
            </button>
            <button
              type="button"
              class="flex-1 py-2 text-sm font-medium transition-colors"
              :style="form.type === 'sell' ? 'background: var(--down); color: white' : 'background: var(--surface-2); color: var(--text-2)'"
              @click="form.type = 'sell'"
            >
              賣出
            </button>
          </div>
        </div>

        <!-- 日期 -->
        <div>
          <label class="stat-label block mb-1">日期</label>
          <input
            v-model="form.date"
            type="date"
            required
            class="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
          />
        </div>

        <!-- 克數 -->
        <div>
          <label class="stat-label block mb-1">克數</label>
          <input
            v-model.number="form.grams"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            required
            class="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
          />
        </div>

        <!-- 單價 -->
        <div>
          <label class="stat-label block mb-1">單價（元/克）</label>
          <input
            v-model.number="form.pricePerGram"
            type="number"
            min="1"
            step="1"
            placeholder="0"
            required
            class="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
          />
        </div>

        <!-- 備註 -->
        <div>
          <label class="stat-label block mb-1">備註（選填）</label>
          <input
            v-model="form.note"
            type="text"
            placeholder="備註..."
            class="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
          />
        </div>

        <!-- 送出 -->
        <div>
          <button
            type="submit"
            class="w-full py-2 rounded-lg font-semibold text-sm transition-colors"
            style="background: var(--gold); color: white"
          >
            新增
          </button>
        </div>
      </form>

      <p v-if="formError" class="text-xs mt-2" style="color: var(--down)">{{ formError }}</p>
    </div>

    <!-- 交易記錄 -->
    <div class="rounded-2xl overflow-hidden" style="background: var(--surface); border: 1px solid var(--border)">
      <div class="px-5 py-4" style="border-bottom: 1px solid var(--border)">
        <h2 class="text-sm font-semibold" style="color: var(--text)">交易記錄</h2>
      </div>

      <div v-if="portfolio.trades.length === 0" class="text-center py-12 text-sm" style="color: var(--text-3)">
        尚無交易記錄，請新增第一筆交易
      </div>

      <table v-else class="w-full text-sm">
        <thead>
          <tr style="border-bottom: 1px solid var(--border)">
            <th class="stat-label px-5 py-3 text-left font-medium">日期</th>
            <th class="stat-label px-5 py-3 text-left font-medium">類型</th>
            <th class="stat-label px-5 py-3 text-right font-medium">克數</th>
            <th class="stat-label px-5 py-3 text-right font-medium">單價</th>
            <th class="stat-label px-5 py-3 text-right font-medium">總金額</th>
            <th class="stat-label px-5 py-3 text-left font-medium">備註</th>
            <th class="stat-label px-5 py-3 text-center font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="trade in [...portfolio.trades].reverse()"
            :key="trade.id"
            style="border-bottom: 1px solid var(--border)"
            @mouseenter="(e) => (e.currentTarget as HTMLElement).style.background='var(--surface-2)'"
            @mouseleave="(e) => (e.currentTarget as HTMLElement).style.background=''"
          >
            <td class="px-5 py-3" style="color: var(--text-2)">{{ formatDate(trade.date) }}</td>
            <td class="px-5 py-3">
              <span
                class="px-2 py-0.5 rounded text-xs font-medium"
                :style="trade.type === 'buy' ? 'background: rgba(26,122,74,0.12); color: var(--up)' : 'background: rgba(197,48,48,0.12); color: var(--down)'"
              >
                {{ trade.type === 'buy' ? '買入' : '賣出' }}
              </span>
            </td>
            <td class="px-5 py-3 text-right price-value" style="color: var(--text)">{{ formatGrams(trade.grams) }}</td>
            <td class="px-5 py-3 text-right price-value" style="color: var(--text)">{{ formatCurrency(trade.pricePerGram) }}</td>
            <td class="px-5 py-3 text-right price-value" style="color: var(--text)">{{ formatCurrency(trade.grams * trade.pricePerGram) }}</td>
            <td class="px-5 py-3 text-xs" style="color: var(--text-3)">{{ trade.note ?? '—' }}</td>
            <td class="px-5 py-3 text-center">
              <button
                class="text-xs transition-colors"
                style="color: var(--down)"
                @click="confirmRemove(trade.id)"
              >
                刪除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TTradeRecord } from '~/types/portfolio'

useHead({ title: '投資損益 | 黃金金價追蹤' })

const goldStore = useGoldPrice()
const portfolio = usePortfolio()

// 快速試算
const calc = reactive({ grams: 0, cost: 0 })
const calcImportMsg = ref('')
const calcImportMsgColor = ref('color: var(--up)')

function importHoldings() {
  calcImportMsg.value = ''
  if (!calc.grams || calc.grams <= 0) {
    calcImportMsg.value = '請輸入有效克數'
    calcImportMsgColor.value = 'color: var(--down)'
    return
  }
  if (!calc.cost || calc.cost <= 0) {
    calcImportMsg.value = '請輸入有效投資金額'
    calcImportMsgColor.value = 'color: var(--down)'
    return
  }
  const avgCost = calc.cost / calc.grams
  portfolio.addTrade({
    type: 'buy',
    date: new Date().toISOString().split('T')[0],
    grams: calc.grams,
    pricePerGram: Math.round(avgCost),
    note: '庫存匯入',
  })
  calcImportMsg.value = `已匯入 ${calc.grams}g，平均成本 ${Math.round(avgCost).toLocaleString()} 元/克`
  calcImportMsgColor.value = 'color: var(--up)'
  calc.grams = 0
  calc.cost = 0
}
const calcResult = computed(() => {
  const g = calc.grams || 0
  const a = calc.cost || 0
  const price = goldStore.current?.todayBuy ?? 0
  const avgCost = g > 0 ? a / g : 0
  const b = g * price
  const pnl = b - a
  const pnlRate = a > 0 ? (pnl / a) * 100 : 0
  const color = pnl > 0 ? 'color: var(--up)' : pnl < 0 ? 'color: var(--down)' : 'color: var(--text)'
  const fmt = (n: number) => n.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  return {
    avgCost: g > 0 ? fmt(avgCost) : '—',
    marketValue: price > 0 && g > 0 ? fmt(b) : '—',
    pnl: a > 0 && price > 0 ? (pnl >= 0 ? '+' : '') + fmt(pnl) : '—',
    pnlRate: a > 0 && price > 0 ? (pnlRate >= 0 ? '+' : '') + pnlRate.toFixed(2) + '%' : '—',
    pnlColor: color,
  }
})

// 表單狀態
const form = reactive<Omit<TTradeRecord, 'id'>>({
  type: 'buy',
  date: new Date().toISOString().split('T')[0],
  grams: 0,
  pricePerGram: 0,
  note: '',
})
const formError = ref('')

function submitTrade() {
  formError.value = ''

  if (!form.grams || form.grams <= 0) {
    formError.value = '請輸入有效克數'
    return
  }
  if (!form.pricePerGram || form.pricePerGram <= 0) {
    formError.value = '請輸入有效單價'
    return
  }
  if (form.type === 'sell' && form.grams > portfolio.summary.totalGrams) {
    formError.value = `賣出克數（${form.grams}g）超過持有量（${portfolio.summary.totalGrams.toFixed(2)}g）`
    return
  }

  portfolio.addTrade({
    type: form.type,
    date: form.date,
    grams: form.grams,
    pricePerGram: form.pricePerGram,
    note: form.note || undefined,
  })

  // 重置數量與備註，保留類型與日期
  form.grams = 0
  form.pricePerGram = goldStore.current
    ? (form.type === 'buy' ? goldStore.current.todayBuy : goldStore.current.todaySell)
    : 0
  form.note = ''
}

function confirmRemove(id: string) {
  if (confirm('確定要刪除此筆交易記錄？')) {
    portfolio.removeTrade(id)
  }
}

// 摘要卡片
const summaryCards = computed(() => {
  const s = portfolio.summary
  const pnl = s.unrealizedPnL
  const realized = s.realizedPnL

  const breakEven = s.totalGrams > 0 ? s.avgCostPerGram : 0
  const sellPrice = goldStore.current?.todaySell ?? 0
  const breakEvenDiff = breakEven > 0 && sellPrice > 0 ? sellPrice - breakEven : null
  const breakEvenPct = breakEven > 0 && breakEvenDiff !== null ? (breakEvenDiff / breakEven) * 100 : null

  return [
    { label: '目前持有', value: formatGrams(s.totalGrams), color: 'var(--gold)', sub: `平均成本 ${formatCurrency(s.avgCostPerGram)}/克`, subColor: 'var(--text-2)' },
    { label: '目前市值', value: formatCurrency(s.currentValue), color: 'var(--text)', sub: '', subColor: 'var(--text-2)' },
    { label: '未實現損益', value: formatCurrency(pnl), color: pnl >= 0 ? 'var(--up)' : 'var(--down)', sub: s.totalCost > 0 ? formatPercent(s.unrealizedPnLPercent) : '', subColor: 'var(--text-2)' },
    { label: '已實現損益', value: formatCurrency(realized), color: realized >= 0 ? 'var(--up)' : 'var(--down)', sub: '', subColor: 'var(--text-2)' },
    {
      label: '損益平衡點',
      value: breakEven > 0 ? `${Math.round(breakEven).toLocaleString()} 元/克` : '—',
      color: 'var(--text)',
      sub: breakEvenDiff !== null && breakEvenPct !== null
        ? `距平衡點 ${breakEvenDiff >= 0 ? '+' : ''}${Math.round(breakEvenDiff).toLocaleString()} 元 (${breakEvenPct >= 0 ? '+' : ''}${breakEvenPct.toFixed(2)}%)`
        : '',
      subColor: breakEvenDiff !== null ? (breakEvenDiff >= 0 ? 'var(--up)' : 'var(--down)') : 'var(--text-2)',
    },
  ]
})

// 表單預設單價同步金價
watch(() => goldStore.current, (c) => {
  if (c && form.pricePerGram === 0) {
    form.pricePerGram = form.type === 'buy' ? c.todayBuy : c.todaySell
  }
})

watch(() => form.type, (type) => {
  if (goldStore.current) {
    form.pricePerGram = type === 'buy' ? goldStore.current.todayBuy : goldStore.current.todaySell
  }
})
</script>

