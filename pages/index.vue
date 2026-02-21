<template>
  <div class="space-y-8">
    <!-- Page header -->
    <div class="flex items-end justify-between">
      <div>
        <p class="stat-label mb-1">臺灣銀行黃金存摺</p>
        <h1
          class="font-display text-3xl font-semibold"
          style="color: var(--text)"
        >
          臺灣銀行金價
        </h1>
      </div>
      <p v-if="goldStore.current" class="stat-label hidden sm:block">
        {{ formatDate(goldStore.current.updatedAt, "MM/DD HH:mm") }} 更新
      </p>
    </div>

    <!-- Main price display -->
    <div
      v-if="goldStore.current"
      class="grid grid-cols-1 sm:grid-cols-2 gap-px"
      style="
        background: var(--border);
        border: 1px solid var(--border);
        border-radius: 16px;
        overflow: hidden;
      "
    >
      <!-- Buy price -->
      <div class="p-6 md:p-8" style="background: var(--surface)">
        <p class="stat-label mb-3">存摺買入</p>
        <p
          class="price-value text-4xl md:text-5xl font-medium"
          style="color: var(--text)"
        >
          {{ goldStore.current.todayBuy.toLocaleString() }}
        </p>
        <p class="stat-label mt-2">元 / 克</p>
        <div class="mt-4 flex items-center gap-2">
          <span
            class="price-value text-sm font-medium"
            :style="
              goldStore.current.change >= 0
                ? 'color: var(--up)'
                : 'color: var(--down)'
            "
          >
            {{ goldStore.current.change >= 0 ? "+" : ""
            }}{{ goldStore.current.change.toFixed(0) }}
          </span>
          <span
            class="price-value text-xs"
            :style="
              goldStore.current.change >= 0
                ? 'color: var(--up)'
                : 'color: var(--down)'
            "
          >
            ({{ formatPercent(goldStore.current.changePercent) }})
          </span>
          <span class="stat-label">今日</span>
        </div>
      </div>

      <!-- Sell price -->
      <div class="p-6 md:p-8" style="background: var(--surface)">
        <p class="stat-label mb-3">存摺賣出</p>
        <p
          class="price-value text-4xl md:text-5xl font-medium"
          style="color: var(--text)"
        >
          {{ goldStore.current.todaySell.toLocaleString() }}
        </p>
        <p class="stat-label mt-2">元 / 克</p>
        <div class="mt-4">
          <span class="stat-label">
            買賣價差
            <span class="price-value" style="color: var(--text-2)">{{
              (
                goldStore.current.todaySell - goldStore.current.todayBuy
              ).toLocaleString()
            }}</span>
            元
          </span>
        </div>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 gap-px"
      style="
        background: var(--border);
        border: 1px solid var(--border);
        border-radius: 16px;
        overflow: hidden;
      "
    >
      <div
        v-for="i in 2"
        :key="i"
        class="p-8 h-44 animate-pulse"
        style="background: var(--surface-2)"
      />
    </div>

    <!-- Stats row -->
    <div v-if="goldStore.current" class="grid grid-cols-3 gap-6">
      <div v-for="stat in rangeStats" :key="stat.label">
        <p class="stat-label mb-1.5">{{ stat.label }}</p>
        <p
          class="price-value text-xl font-medium"
          :style="stat.value >= 0 ? 'color: var(--up)' : 'color: var(--down)'"
        >
          {{ stat.value >= 0 ? "+" : "" }}{{ stat.value.toFixed(0) }}
        </p>
        <p class="stat-label mt-0.5">元</p>
      </div>
    </div>

    <!-- Divider -->
    <div class="h-px" style="background: var(--border)" />

    <!-- Mini chart + News -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="flex items-center justify-between mb-5">
          <p class="text-sm font-medium" style="color: var(--text)">
            近30日走勢
          </p>
          <NuxtLink
            to="/chart"
            class="stat-label transition-colors"
            style="color: var(--gold)"
            >查看完整圖表 →</NuxtLink
          >
        </div>
        <ClientOnly>
          <VChart :option="miniChartOption" autoresize style="height: 200px" />
          <template #fallback>
            <div
              class="h-[200px] animate-pulse rounded-lg"
              style="background: var(--surface-2)"
            />
          </template>
        </ClientOnly>
      </div>

      <div>
        <div class="flex items-center justify-between mb-5">
          <p class="text-sm font-medium" style="color: var(--text)">最新消息</p>
          <NuxtLink to="/news" class="stat-label" style="color: var(--gold)"
            >更多 →</NuxtLink
          >
        </div>
        <div v-if="newsStore.loading" class="space-y-4">
          <div
            v-for="i in 3"
            :key="i"
            class="h-12 animate-pulse rounded"
            style="background: var(--surface-2)"
          />
        </div>
        <div v-else class="space-y-5">
          <a
            v-for="item in latestNews"
            :key="item.id"
            :href="item.url"
            target="_blank"
            class="block group"
          >
            <p
              class="text-sm leading-snug line-clamp-2 transition-colors"
              style="color: var(--text-2)"
            >
              <span
                class="group-hover:underline decoration-[var(--gold)] underline-offset-2"
                >{{ item.title }}</span
              >
            </p>
            <p class="stat-label mt-1">
              {{ item.source }} ·
              {{ formatDate(item.publishedAt, "MM/DD HH:mm") }}
            </p>
          </a>
        </div>
      </div>
    </div>

    <!-- Taiwan Bank link -->
    <div>
      <a
        href="https://rate.bot.com.tw/gold/passbook"
        target="_blank"
        rel="noopener noreferrer"
        class="stat-label transition-colors"
        style="color: var(--gold)"
      >
        ◈ 查看臺灣銀行黃金存摺牌告價格 →
      </a>
    </div>

    <!-- Divider -->
    <div class="h-px" style="background: var(--border)" />

    <!-- International Gold Price -->
    <div>
      <div class="flex items-end justify-between">
        <div>
          <p class="stat-label mb-1">COMEX 黃金期貨</p>
          <h2
            class="font-display text-3xl font-semibold"
            style="color: var(--text)"
          >
            國際金價
          </h2>
        </div>
        <p v-if="goldStore.international" class="stat-label hidden sm:block">
          {{ formatDate(goldStore.international.updatedAt, "MM/DD HH:mm") }}
          更新
        </p>
      </div>

      <div
        v-if="goldStore.international && goldStore.international.priceUSD > 0"
        class="grid grid-cols-1 sm:grid-cols-3 gap-px"
        style="
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        "
      >
        <!-- USD / troy oz -->
        <div class="p-6" style="background: var(--surface)">
          <p class="stat-label mb-3">現貨價格</p>
          <p
            class="price-value text-3xl font-medium"
            style="color: var(--text)"
          >
            {{
              goldStore.international.priceUSD.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}
          </p>
          <p class="stat-label mt-2">USD / 盎司</p>
          <div class="mt-4 flex items-center gap-2">
            <span
              class="price-value text-sm font-medium"
              :style="
                goldStore.international.change >= 0
                  ? 'color: var(--up)'
                  : 'color: var(--down)'
              "
            >
              {{ goldStore.international.change >= 0 ? "+" : ""
              }}{{ goldStore.international.change.toFixed(2) }}
            </span>
            <span
              class="price-value text-xs"
              :style="
                goldStore.international.change >= 0
                  ? 'color: var(--up)'
                  : 'color: var(--down)'
              "
            >
              ({{ formatPercent(goldStore.international.changePercent) }})
            </span>
            <span class="stat-label">今日</span>
          </div>
        </div>

        <!-- USD / gram -->
        <div class="p-6" style="background: var(--surface)">
          <p class="stat-label mb-3">換算每克</p>
          <p
            class="price-value text-3xl font-medium"
            style="color: var(--text)"
          >
            {{
              goldStore.international.priceUSDPerGram.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}
          </p>
          <p class="stat-label mt-2">USD / 克</p>
        </div>

        <!-- 1 troy oz = ? grams -->
        <div class="p-6" style="background: var(--surface)">
          <p class="stat-label mb-3">單位換算</p>
          <p
            class="price-value text-xl font-medium"
            style="color: var(--text-2)"
          >
            1 盎司 = 31.1035 克
          </p>
          <p
            class="price-value text-xl font-medium mt-2"
            style="color: var(--text-2)"
          >
            1 克 = 0.03215 盎司
          </p>
          <p class="stat-label mt-3">資料來源：COMEX (GC=F)</p>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div
        v-else-if="goldStore.loadingInternational"
        class="grid grid-cols-1 sm:grid-cols-3 gap-px"
        style="
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        "
      >
        <div
          v-for="i in 3"
          :key="i"
          class="p-6 h-36 animate-pulse"
          style="background: var(--surface-2)"
        />
      </div>

      <!-- Error / unavailable -->
      <div
        v-else
        class="p-6 rounded-2xl text-center"
        style="background: var(--surface-2); border: 1px solid var(--border)"
      >
        <p class="stat-label">國際金價暫時無法取得</p>
      </div>
    </div>

    <!-- International Gold link -->
    <div>
      <a
        href="https://stooq.com/q/?s=xauusd"
        target="_blank"
        rel="noopener noreferrer"
        class="stat-label transition-colors"
        style="color: var(--gold)"
      >
        ◈ 查看國際金價 →
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EChartsOption } from "echarts";

useHead({ title: "儀表板 | 黃金金價追蹤" });

const goldStore = useGoldPrice();
const newsStore = useNewsStore();
onMounted(() => newsStore.fetch());

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");
const borderColor = computed(() => (isDark.value ? "#252522" : "#E5E5E2"));
const labelColor = computed(() => (isDark.value ? "#505050" : "#A8A8A4"));

const latestNews = computed(() => newsStore.items.slice(0, 4));

const rangeStats = computed(() => {
  const c = goldStore.current;
  if (!c) return [];
  return [
    { label: "近7天", value: c.weekChange },
    { label: "近1月", value: c.monthChange },
    { label: "近1年", value: c.yearChange },
  ];
});

const miniChartOption = computed<EChartsOption>(() => {
  const data = goldStore.history.slice(-30);
  return {
    backgroundColor: "transparent",
    grid: { top: 8, right: 8, bottom: 28, left: 52 },
    xAxis: {
      type: "category",
      data: data.map((p) => p.date.slice(5)),
      axisLabel: { color: labelColor.value, fontSize: 10, interval: 4 },
      axisLine: { lineStyle: { color: borderColor.value } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      scale: true,
      min: (v: { min: number }) => Math.floor(v.min * 0.999),
      max: (v: { max: number }) => Math.ceil(v.max * 1.001),
      axisLabel: { color: labelColor.value, fontSize: 10 },
      splitLine: { lineStyle: { color: borderColor.value, type: "dashed" } },
    },
    series: [
      {
        type: "line",
        data: data.map((p) => p.buyPrice),
        lineStyle: { color: "#C4973F", width: 1.5 },
        itemStyle: { color: "#C4973F" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(196,151,63,0.15)" },
              { offset: 1, color: "rgba(196,151,63,0)" },
            ],
          },
        },
        smooth: true,
        showSymbol: false,
      },
    ],
    tooltip: {
      trigger: "axis",
      backgroundColor: "#0D0D0C",
      borderColor: "#252522",
      textStyle: { color: "#F0F0EE", fontSize: 11, fontFamily: "DM Mono" },
      formatter: (params: unknown) => {
        const p = (params as Array<{ name: string; value: number }>)[0];
        return `${p.name}  ${p.value.toLocaleString()}`;
      },
    },
  };
});
</script>
