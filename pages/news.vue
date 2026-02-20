<template>
  <div class="space-y-8">
    <div>
      <p class="stat-label mb-1">黃金市場</p>
      <h1 class="font-display text-3xl font-semibold" style="color: var(--text)">最新消息</h1>
    </div>

    <div class="flex flex-wrap items-center gap-3 text-xs">
      <span class="stat-label">標籤說明：</span>
      <span class="px-2 py-0.5 rounded font-medium" style="background: rgba(26,122,74,0.12); color: var(--up)">利多 — 對金價有正面影響</span>
      <span class="px-2 py-0.5 rounded font-medium" style="background: var(--surface-2); color: var(--text-3)">中立 — 影響方向不明確</span>
      <span class="px-2 py-0.5 rounded font-medium" style="background: rgba(197,48,48,0.12); color: var(--down)">利空 — 對金價有負面影響</span>
    </div>

    <div v-if="newsStore.loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="i in 6" :key="i" class="h-36 animate-pulse rounded-xl" style="background: var(--surface-2)" />
    </div>

    <div v-else-if="newsStore.error" class="py-12 text-center" style="color: var(--text-2)">
      {{ newsStore.error }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <a
        v-for="item in newsStore.items"
        :key="item.id"
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
        class="group flex flex-col gap-3 p-5 rounded-xl transition-all"
        style="background: var(--surface); border: 1px solid var(--border)"
        onmouseenter="this.style.borderColor='var(--gold)'"
        onmouseleave="this.style.borderColor='var(--border)'"
      >
        <div class="flex items-center justify-between">
          <span class="stat-label">{{ item.source }}</span>
          <span
            v-if="item.sentiment"
            class="px-2 py-0.5 rounded text-xs font-medium"
            :style="sentimentStyle(item.sentiment)"
          >{{ sentimentLabel(item.sentiment) }}</span>
        </div>
        <h2 class="text-sm font-medium leading-snug line-clamp-2 transition-colors" style="color: var(--text)">
          {{ item.title }}
        </h2>
        <p class="text-xs leading-relaxed line-clamp-3 flex-1" style="color: var(--text-2)">{{ item.summary }}</p>
        <p class="stat-label">{{ formatDate(item.publishedAt, 'YYYY/MM/DD HH:mm') }}</p>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '新聞 | 黃金金價追蹤' })
const newsStore = useNewsStore()
onMounted(() => newsStore.fetch())

function sentimentStyle(s: 'positive' | 'negative' | 'neutral') {
  return {
    positive: 'background: rgba(26,122,74,0.12); color: var(--up)',
    negative: 'background: rgba(197,48,48,0.12); color: var(--down)',
    neutral: 'background: var(--surface-2); color: var(--text-3)',
  }[s]
}
function sentimentLabel(s: 'positive' | 'negative' | 'neutral') {
  return { positive: '利多', negative: '利空', neutral: '中立' }[s]
}
</script>

