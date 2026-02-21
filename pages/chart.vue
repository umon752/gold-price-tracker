<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-end justify-between">
      <div>
        <p class="stat-label mb-1">臺灣銀行黃金存摺</p>
        <h1
          class="font-display text-3xl font-semibold"
          style="color: var(--text)"
        >
          走勢圖
        </h1>
      </div>
      <!-- Range selector -->
      <div
        class="flex items-center gap-1 p-1 rounded-lg"
        style="background: var(--surface-2); border: 1px solid var(--border)"
      >
        <button
          v-for="r in ranges"
          :key="r.value"
          class="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          :style="
            goldStore.selectedRange === r.value
              ? 'background: var(--surface); color: var(--gold); box-shadow: 0 1px 3px rgba(0,0,0,0.08)'
              : 'color: var(--text-2)'
          "
          @click="changeRange(r.value)"
        >
          {{ r.label }}
        </button>
      </div>
    </div>

    <!-- Chart -->
    <div
      class="rounded-2xl overflow-hidden"
      style="border: 1px solid var(--border); background: var(--surface)"
    >
      <div class="px-6 py-4" style="border-bottom: 1px solid var(--border)">
        <p class="stat-label">買入 / 賣出牌告價（元/克）</p>
      </div>
      <div class="p-4">
        <div
          v-if="goldStore.loadingHistory"
          class="h-[360px] animate-pulse rounded-lg"
          style="background: var(--surface-2)"
        />
        <ClientOnly v-else>
          <VChart :option="chartOption" autoresize style="height: 360px" />
        </ClientOnly>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="goldStore.current" class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div v-for="s in priceStats" :key="s.label">
        <p class="stat-label mb-1.5">{{ s.label }}</p>
        <p class="price-value text-lg font-medium" :style="`color: ${s.color}`">
          {{ s.value }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EChartsOption } from "echarts";
import type { TTimeRange } from "~/types/gold";

useHead({ title: "走勢圖 | 黃金金價追蹤" });

const goldStore = useGoldPrice();
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");
const borderColor = computed(() => (isDark.value ? "#252522" : "#E5E5E2"));
const labelColor = computed(() => (isDark.value ? "#505050" : "#A8A8A4"));
const legendColor = computed(() => (isDark.value ? "#505050" : "#6B6B67"));

const ranges: Array<{ label: string; value: TTimeRange }> = [
  { label: "7天", value: "day" },
  { label: "1月", value: "week" },
  { label: "3月", value: "month" },
  { label: "1年", value: "year" },
];

async function changeRange(range: TTimeRange) {
  await goldStore.fetchHistory(range);
}

const rangeChangeMap: Record<
  string,
  {
    label: string;
    key: "weekChange" | "monthChange" | "threeMonthChange" | "yearChange";
  }
> = {
  day: { label: "近7天漲跌", key: "weekChange" },
  week: { label: "近1月漲跌", key: "monthChange" },
  month: { label: "近3月漲跌", key: "threeMonthChange" },
  year: { label: "近1年漲跌", key: "yearChange" },
};

const priceStats = computed(() => {
  const c = goldStore.current;
  if (!c) return [];
  const sign = (v: number) => (v >= 0 ? `+${v.toFixed(0)}` : `${v.toFixed(0)}`);
  const col = (v: number) => (v >= 0 ? "var(--up)" : "var(--down)");
  const rc = rangeChangeMap[goldStore.selectedRange];
  const rv = c[rc.key];
  return [
    {
      label: "存摺買入價",
      value: `${c.todayBuy.toLocaleString()} 元/克`,
      color: "var(--text)",
    },
    {
      label: "存摺賣出價",
      value: `${c.todaySell.toLocaleString()} 元/克`,
      color: "var(--text)",
    },
    {
      label: "今日漲跌",
      value: `${sign(c.change)} (${formatPercent(c.changePercent)})`,
      color: col(c.change),
    },
    { label: rc.label, value: `${sign(rv)} 元`, color: col(rv) },
  ];
});

const chartOption = computed<EChartsOption>(() => {
  const data = goldStore.history;
  return {
    backgroundColor: "transparent",
    grid: { top: 40, right: 16, bottom: 56, left: 64 },
    xAxis: {
      type: "category",
      data: data.map((p) => p.date),
      axisLabel: {
        color: labelColor.value,
        fontSize: 10,
        rotate: data.length > 90 ? 30 : 0,
      },
      axisLine: { lineStyle: { color: borderColor.value } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      scale: true,
      min: (v: { min: number }) => Math.floor(v.min * 0.999),
      max: (v: { max: number }) => Math.ceil(v.max * 1.001),
      axisLabel: {
        color: labelColor.value,
        fontSize: 10,
        formatter: (v: number) => v.toLocaleString(),
      },
      splitLine: { lineStyle: { color: borderColor.value, type: "dashed" } },
    },
    legend: { textStyle: { color: legendColor.value, fontSize: 11 }, top: 0 },
    series: [
      {
        name: "買入",
        type: "line",
        data: data.map((p) => p.buyPrice),
        lineStyle: { color: "#C4973F", width: 1.5 },
        itemStyle: { color: "#C4973F" },
        smooth: true,
        showSymbol: false,
      },
      {
        name: "賣出",
        type: "line",
        data: data.map((p) => p.sellPrice),
        lineStyle: { color: "#888884", width: 1.5 },
        itemStyle: { color: "#888884" },
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
        const ps = params as Array<{
          seriesName: string;
          value: number;
          name: string;
          color: string;
        }>;
        return `<span style="color:#888884;font-size:12px">${ps[0]?.name}</span><br/>${ps.map((p) => `<span style="color:${p.color}">■</span> ${p.seriesName} <span style="font-family:DM Mono">${p.value.toLocaleString()}</span>`).join("<br/>")}`;
      },
    },
    dataZoom: [{ type: "inside", start: 0, end: 100 }],
  };
});
</script>
