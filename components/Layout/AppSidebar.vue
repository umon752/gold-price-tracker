<template>
  <div>
  <aside
    class="flex flex-col fixed inset-y-0 left-0 z-30 w-56
           md:sticky md:top-0 md:h-screen md:translate-x-0
           transform transition-transform duration-300 ease-in-out"
    :class="mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    style="background: var(--surface); border-right: 1px solid var(--border);"
  >
    <!-- Logo -->
    <div class="h-16 flex items-center justify-between px-6 shrink-0">
      <NuxtLink to="/" class="flex items-center gap-2.5 group">
        <span class="text-lg" style="color: var(--gold)">◈</span>
        <span class="font-display text-xl font-semibold tracking-wide" style="color: var(--text)">
          黃金追蹤
        </span>
      </NuxtLink>
      <button
        class="md:hidden p-1 rounded"
        style="color: var(--text-3)"
        @click="emit('close')"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Nav divider -->
    <div class="mx-6 h-px" style="background: var(--border)" />

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-0.5">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative"
        :class="$route.path === item.to ? 'active-nav' : 'inactive-nav'"
      >
        <span class="text-sm opacity-70">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <!-- Dark/Light Toggle -->
    <div class="px-6 py-4 shrink-0 space-y-3" style="border-top: 1px solid var(--border)">
      <!-- 登入狀態 -->
      <div v-if="authStore.isLoggedIn" class="flex items-center justify-between">
        <div class="min-w-0">
          <p class="stat-label">已登入</p>
          <p class="text-xs truncate mt-0.5" style="color: var(--text-2)">{{ authStore.user?.email }}</p>
        </div>
        <button class="stat-label transition-colors hover:text-red-400" style="color: var(--text-3)" @click="authStore.signOut()">登出</button>
      </div>
      <button
        v-else
        class="w-full py-2 rounded-lg text-xs font-semibold transition-colors"
        style="border: 1px solid var(--border); color: var(--text-2)"
        @click="openLogin()"
      >
        登入 / 註冊
      </button>

      <!-- Dark/Light -->
      <div class="flex items-center justify-between">
        <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-3)">
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-3)">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <button
          role="switch"
          :aria-checked="isDark"
          class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
          :style="isDark ? 'background: var(--gold)' : 'background: var(--border)'"
          @click="toggleColorMode"
        >
          <span
            class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform"
            :class="isDark ? 'translate-x-[18px]' : 'translate-x-[3px]'"
          />
        </button>
      </div>
    </div>
  </aside>

  <AuthAuthModal :show="showAuthModal" :initial-step="authModalInitialStep" @close="showAuthModal = false" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ mobileOpen: boolean }>()
const emit = defineEmits<{ close: [] }>()

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const authStore = useAuthStore()
const showAuthModal = ref(false)
const authModalInitialStep = ref<'prompt' | 'email'>('email')

onMounted(async () => {
  authStore.init()
})

function openLogin() {
  authModalInitialStep.value = 'email'
  showAuthModal.value = true
}

const navItems = [
  { to: '/', label: '儀表板', icon: '◎' },
  { to: '/chart', label: '走勢圖', icon: '◇' },
  { to: '/news', label: '新聞', icon: '◈' },
  { to: '/portfolio', label: '損益', icon: '◉' },
]

function toggleColorMode() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<style scoped>
.active-nav {
  color: var(--gold);
  background: color-mix(in srgb, var(--gold) 8%, transparent);
  font-weight: 600;
}
.inactive-nav {
  color: var(--text-2);
}
.inactive-nav:hover {
  color: var(--text);
  background: var(--surface-2);
}
</style>

