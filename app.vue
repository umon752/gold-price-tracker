<template>
  <div
    class="min-h-screen"
    style="background: var(--surface); color: var(--text)"
  >
    <div class="flex">
      <LayoutAppSidebar
        :mobile-open="sidebarOpen"
        @close="sidebarOpen = false"
        @open-auth="openAuthModal('prompt')"
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
        <header
          class="md:hidden h-14 flex items-center justify-between px-4 sticky top-0 z-10"
          style="background: var(--surface); border-bottom: 1px solid var(--border);"
        >
          <button class="p-2 rounded-lg transition-colors" style="color: var(--text-2)" @click="sidebarOpen = true">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <span class="font-display text-lg font-semibold" style="color: var(--text)">黃金追蹤</span>
          <div class="w-9" />
        </header>

        <main class="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          <NuxtPage />
        </main>
        <LayoutAppFooter />
      </div>
    </div>

    <!-- Auth Modal (inline) -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px)"
          @click.self="showModal = false"
        >
          <div class="w-full max-w-sm rounded-2xl p-6 space-y-5" style="background: var(--surface); border: 1px solid var(--border)">

            <!-- Step: prompt -->
            <template v-if="modalStep === 'prompt'">
              <div class="text-center space-y-1 pt-1">
                <div class="text-3xl mb-3">◈</div>
                <h2 class="text-base font-semibold" style="color: var(--text)">保存您的損益資料</h2>
                <p class="text-xs leading-relaxed" style="color: var(--text-2)">
                  使用 Email 登入可將資料雲端同步，<br>不同瀏覽器、裝置都能查看同一份記錄。
                </p>
                <p class="text-xs" style="color: var(--text-3)">否則資料僅保存在此瀏覽器的本地儲存。</p>
              </div>
              <div class="space-y-2 pt-1">
                <button
                  class="w-full py-2.5 rounded-lg text-sm font-semibold"
                  style="background: var(--gold); color: white"
                  @click="modalStep = 'email'"
                >使用 Email 登入同步資料</button>
                <button
                  class="w-full py-2.5 rounded-lg text-sm"
                  style="border: 1px solid var(--border); color: var(--text-2)"
                  @click="showModal = false"
                >不需要，使用本地儲存</button>
              </div>
            </template>

            <!-- Step: email -->
            <template v-else-if="modalStep === 'email'">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-base font-semibold" style="color: var(--text)">輸入 Email</h2>
                  <p class="text-xs mt-0.5" style="color: var(--text-3)">我們會寄送一次性登入連結到您的信箱</p>
                </div>
                <button class="p-1 rounded-lg" style="color: var(--text-3)" @click="showModal = false">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div>
                <label class="stat-label block mb-1">Email</label>
                <input
                  v-model="modalEmail"
                  type="email"
                  placeholder="your@email.com"
                  class="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
                  @keydown.enter="sendLink"
                />
              </div>
              <p v-if="modalError" class="text-xs" style="color: var(--down)">{{ modalError }}</p>
              <button
                class="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity"
                style="background: var(--gold); color: white"
                :class="modalLoading ? 'opacity-60' : ''"
                :disabled="modalLoading"
                @click="sendLink"
              >{{ modalLoading ? '寄送中…' : '寄送登入連結' }}</button>
              <p class="text-xs text-center" style="color: var(--text-3)">首次使用將自動建立帳號</p>
            </template>

            <!-- Step: sent -->
            <template v-else>
              <div class="text-center space-y-3 py-2">
                <div class="text-3xl">📬</div>
                <p class="text-sm font-medium" style="color: var(--text)">登入連結已寄出！</p>
                <p class="text-xs" style="color: var(--text-2)">請到 <span style="color: var(--gold)">{{ modalEmail }}</span> 的信箱點擊連結完成登入</p>
                <button class="text-xs" style="color: var(--text-3)" @click="modalStep = 'email'">重新輸入 Email</button>
              </div>
            </template>

          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false)
const route = useRoute()
watch(() => route.path, () => { sidebarOpen.value = false })

const authStore = useAuthStore()
const portfolioStore = usePortfolioStore()

// Modal state
const showModal = ref(false)
const modalStep = ref<'prompt' | 'email' | 'sent'>('prompt')
const modalEmail = ref('')
const modalError = ref('')
const modalLoading = ref(false)

const ASKED_KEY = 'gold_auth_asked'

function openAuthModal(step: 'prompt' | 'email' = 'prompt') {
  modalStep.value = step
  modalEmail.value = ''
  modalError.value = ''
  showModal.value = true
}

async function sendLink() {
  modalError.value = ''
  if (!modalEmail.value || !modalEmail.value.includes('@')) {
    modalError.value = '請輸入有效的 Email'
    return
  }
  modalLoading.value = true
  const err = await authStore.sendMagicLink(modalEmail.value)
  modalLoading.value = false
  if (err) { modalError.value = err; return }
  modalStep.value = 'sent'
}

onMounted(() => {
  authStore.init()
  setTimeout(() => {
    if (!localStorage.getItem(ASKED_KEY)) {
      localStorage.setItem(ASKED_KEY, '1')
      openAuthModal('prompt')
    }
  }, 800)
})

// 登入成功後自動匯入 localStorage 資料
watch(() => authStore.isLoggedIn, async (loggedIn) => {
  if (loggedIn) {
    showModal.value = false
    await portfolioStore.migrateFromLocalStorage()
  }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>


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
