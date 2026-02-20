<template>
  <footer class="px-4 md:px-8 py-5 mt-8" style="border-top: 1px solid var(--border)">
    <div class="max-w-5xl mx-auto flex items-center justify-between">
      <span class="stat-label">
        © {{ year }}
        <a href="https://rate.bot.com.tw/gold" target="_blank" rel="noopener noreferrer"
           style="color: var(--gold)">臺灣銀行</a>
        資料來源
      </span>
      <span class="stat-label">金價僅供參考</span>
    </div>
  </footer>
</template>
<script setup lang="ts">
const year = new Date().getFullYear()
</script>

