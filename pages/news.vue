<template>
  <div class="space-y-8">
    <div>
      <p class="stat-label mb-1">黃金市場</p>
      <h1
        class="font-display text-3xl font-semibold"
        style="color: var(--text)"
      >
        最新消息
      </h1>
    </div>

    <!-- AI 每日簡報 -->
    <div
      class="rounded-2xl p-5 space-y-4"
      style="background: var(--surface); border: 1px solid var(--border)"
    >
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-semibold" style="color: var(--text)">
            ✦ 今日金市 AI 簡報
          </h2>
          <p class="text-xs mt-0.5" style="color: var(--text-3)">
            AI 彙整今日新聞，生成市場摘要
          </p>
        </div>
        <button
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity"
          style="background: var(--gold); color: white"
          :class="briefLoading ? 'opacity-60' : ''"
          :disabled="briefLoading || newsStore.loading"
          @click="fetchBrief"
        >
          {{ briefLoading ? "生成中…" : brief ? "重新生成" : "生成簡報" }}
        </button>
      </div>
      <div
        v-if="briefLoading"
        class="flex items-center gap-2 text-xs"
        style="color: var(--text-3)"
      >
        <span class="animate-spin">◌</span> AI 分析中，請稍候…
      </div>
      <template v-else-if="brief">
        <div
          class="rounded-xl p-4 text-sm leading-relaxed"
          style="background: var(--surface-2); color: var(--text-2)"
        >
          <p class="text-xs font-semibold mb-2" style="color: var(--gold)">
            📰 今日金市摘要
          </p>
          <p>{{ brief }}</p>
        </div>
        <p class="text-xs" style="color: var(--text-3)">
          AI 分析僅供參考，投資有風險，請自行判斷。
        </p>
      </template>
    </div>

    <div class="flex flex-wrap items-center gap-3 text-xs">
      <span class="stat-label">標籤說明：</span>
      <span
        class="px-2 py-0.5 rounded font-medium"
        style="background: rgba(26, 122, 74, 0.12); color: var(--up)"
        >利多 — 對金價有正面影響</span
      >
      <span
        class="px-2 py-0.5 rounded font-medium"
        style="background: var(--surface-2); color: var(--text-3)"
        >中立 — 影響方向不明確</span
      >
      <span
        class="px-2 py-0.5 rounded font-medium"
        style="background: rgba(197, 48, 48, 0.12); color: var(--down)"
        >利空 — 對金價有負面影響</span
      >
    </div>

    <div v-if="newsStore.loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="i in 6"
        :key="i"
        class="h-36 animate-pulse rounded-xl"
        style="background: var(--surface-2)"
      />
    </div>

    <div
      v-else-if="newsStore.error"
      class="py-12 text-center"
      style="color: var(--text-2)"
    >
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
        onmouseenter="this.style.borderColor = 'var(--gold)'"
        onmouseleave="this.style.borderColor = 'var(--border)'"
      >
        <div class="flex items-center justify-between">
          <span class="stat-label">{{ item.source }}</span>
          <span
            v-if="item.sentiment"
            class="px-2 py-0.5 rounded text-xs font-medium"
            :style="sentimentStyle(item.sentiment)"
            >{{ sentimentLabel(item.sentiment) }}</span
          >
        </div>
        <h2
          class="text-sm font-medium leading-snug line-clamp-2 transition-colors"
          style="color: var(--text)"
        >
          {{ item.title }}
        </h2>
        <p
          class="text-xs leading-relaxed line-clamp-3 flex-1"
          style="color: var(--text-2)"
        >
          {{ item.summary }}
        </p>
        <p class="stat-label">
          {{ formatDate(item.publishedAt, "YYYY/MM/DD HH:mm") }}
        </p>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: "新聞 | 黃金金價追蹤" });
const newsStore = useNewsStore();
const goldStore = useGoldPrice();

const brief = useState("ai-brief", () => "");
const briefLoading = ref(false);

onMounted(async () => {
  await newsStore.fetch();
  // 新聞載入後自動執行 AI 情緒分析
  applyAiSentiment();
});

async function applyAiSentiment() {
  if (!newsStore.items.length) return;
  try {
    const articles = newsStore.items.map((i) => ({
      title: i.title,
      summary: i.summary,
    }));
    const results = await $fetch<{ index: number; sentiment: string }[]>(
      "/api/ai/news-sentiment",
      {
        method: "POST",
        body: { articles },
      },
    );
    results.forEach((r) => {
      const item = newsStore.items[r.index - 1];
      if (item) {
        const map: Record<string, "positive" | "negative" | "neutral"> = {
          bullish: "positive",
          bearish: "negative",
          neutral: "neutral",
        };
        item.sentiment = map[r.sentiment] ?? "neutral";
      }
    });
  } catch {
    /* 失敗保留原 sentiment */
  }
}

async function fetchBrief() {
  if (!newsStore.items.length) return;
  briefLoading.value = true;
  brief.value = "";
  try {
    const currentPrice = goldStore.current?.todaySell ?? 0;
    const priceChange = goldStore.current?.change ?? 0;
    const res = await $fetch<{ brief: string }>("/api/ai/daily-brief", {
      method: "POST",
      body: {
        articles: newsStore.items.map((i) => ({ title: i.title })),
        currentPrice,
        priceChange,
      },
    });
    brief.value = res.brief;
  } catch {
    brief.value = "簡報生成失敗，請稍後再試。";
  } finally {
    briefLoading.value = false;
  }
}

function sentimentStyle(s: "positive" | "negative" | "neutral") {
  return {
    positive: "background: rgba(26,122,74,0.12); color: var(--up)",
    negative: "background: rgba(197,48,48,0.12); color: var(--down)",
    neutral: "background: var(--surface-2); color: var(--text-3)",
  }[s];
}
function sentimentLabel(s: "positive" | "negative" | "neutral") {
  return { positive: "利多", negative: "利空", neutral: "中立" }[s];
}
</script>
