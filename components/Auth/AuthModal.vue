<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px)"
        @click.self="handleClose"
      >
        <div class="w-full max-w-sm rounded-2xl p-6 space-y-5" style="background: var(--surface); border: 1px solid var(--border)">

          <!-- Step 1: 首次詢問 -->
          <template v-if="step === 'prompt'">
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
                @click="step = 'email'"
              >
                使用 Email 登入同步資料
              </button>
              <button
                class="w-full py-2.5 rounded-lg text-sm"
                style="border: 1px solid var(--border); color: var(--text-2)"
                @click="handleClose"
              >
                不需要，使用本地儲存
              </button>
            </div>
          </template>

          <!-- Step 2: 輸入 Email -->
          <template v-else-if="step === 'email'">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-base font-semibold" style="color: var(--text)">輸入 Email</h2>
                <p class="text-xs mt-0.5" style="color: var(--text-3)">我們會寄送一次性登入連結到您的信箱</p>
              </div>
              <button class="p-1 rounded-lg" style="color: var(--text-3)" @click="handleClose">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div>
              <label class="stat-label block mb-1">Email</label>
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                autofocus
                class="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
                @keydown.enter="submit"
              />
            </div>
            <p v-if="errorMsg" class="text-xs" style="color: var(--down)">{{ errorMsg }}</p>
            <button
              class="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity"
              style="background: var(--gold); color: white"
              :class="authStore.loading ? 'opacity-60' : ''"
              :disabled="authStore.loading"
              @click="submit"
            >
              {{ authStore.loading ? '寄送中…' : '寄送登入連結' }}
            </button>
            <p class="text-xs text-center" style="color: var(--text-3)">首次使用將自動建立帳號</p>
          </template>

          <!-- Step 3: 已寄出 -->
          <template v-else>
            <div class="text-center space-y-3 py-2">
              <div class="text-3xl">📬</div>
              <p class="text-sm font-medium" style="color: var(--text)">登入連結已寄出！</p>
              <p class="text-xs" style="color: var(--text-2)">請到 <span style="color: var(--gold)">{{ email }}</span> 的信箱點擊連結完成登入</p>
              <button class="text-xs" style="color: var(--text-3)" @click="step = 'email'; authStore.magicLinkSent = false">重新輸入 Email</button>
            </div>
          </template>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ show: boolean; initialStep?: 'prompt' | 'email' }>()
const emit = defineEmits<{ close: [] }>()

const authStore = useAuthStore()
const email = ref('')
const errorMsg = ref('')
const step = ref<'prompt' | 'email' | 'sent'>(props.initialStep ?? 'email')

watch(() => props.show, (val) => {
  if (val) {
    step.value = props.initialStep ?? 'email'
    errorMsg.value = ''
    authStore.magicLinkSent = false
  }
})

watch(() => authStore.magicLinkSent, (val) => {
  if (val) step.value = 'sent'
})

function handleClose() {
  emit('close')
}

async function submit() {
  errorMsg.value = ''
  if (!email.value || !email.value.includes('@')) {
    errorMsg.value = '請輸入有效的 Email'
    return
  }
  const err = await authStore.sendMagicLink(email.value)
  if (err) errorMsg.value = err
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

