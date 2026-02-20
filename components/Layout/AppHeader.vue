<template>
  <header class="border-b border-gray-800 bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold text-yellow-400">
        <span>🪙</span>
        <span>黃金金價追蹤</span>
      </NuxtLink>

      <!-- Navigation -->
      <nav class="flex items-center gap-6 text-sm font-medium">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="text-gray-300 hover:text-yellow-400 transition-colors"
          active-class="text-yellow-400"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const navItems = [
  { to: '/', label: '📊 儀表板' },
  { to: '/chart', label: '📈 走勢圖' },
  { to: '/news', label: '📰 新聞' },
  { to: '/portfolio', label: '💰 投資損益' },
]
</script>
