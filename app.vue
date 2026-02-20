<template>
  <div
    class="min-h-screen"
    style="background: var(--surface); color: var(--text)"
  >
    <div class="flex">
      <LayoutAppSidebar
        :mobile-open="sidebarOpen"
        @close="sidebarOpen = false"
      />

      <Transition name="fade">
        <div
          v-if="sidebarOpen"
          class="fixed inset-0 z-20 md:hidden"
          style="background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(2px)"
          @click="sidebarOpen = false"
        />
      </Transition>

      <div class="flex-1 min-w-0 flex flex-col">
        <!-- Mobile header -->
        <header
          class="md:hidden h-14 flex items-center justify-between px-4 sticky top-0 z-10"
          style="
            background: var(--surface);
            border-bottom: 1px solid var(--border);
          "
        >
          <button
            class="p-2 rounded-lg transition-colors"
            style="color: var(--text-2)"
            @click="sidebarOpen = true"
          >
            <svg
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <span
            class="font-display text-lg font-semibold"
            style="color: var(--text)"
            >黃金追蹤</span
          >
          <div class="w-9" />
        </header>

        <main class="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          <NuxtPage />
        </main>
        <LayoutAppFooter />
      </div>
    </div>

    <!-- 首次訪問登入提示 -->
    <AuthAuthModal
      :show="showFirstVisitModal"
      initial-step="prompt"
      @close="showFirstVisitModal = false"
    />
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false);
const route = useRoute();
watch(
  () => route.path,
  () => {
    sidebarOpen.value = false;
  },
);

const authStore = useAuthStore()
const showFirstVisitModal = ref(false)
const ASKED_KEY = 'gold_auth_asked'

onMounted(() => {
  authStore.init()
  // 首次進入且未登入 → 延遲顯示提示彈窗
  setTimeout(() => {
    if (!localStorage.getItem(ASKED_KEY)) {
      localStorage.setItem(ASKED_KEY, '1')
      showFirstVisitModal.value = true
    }
  }, 800)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
