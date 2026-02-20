<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px)"
        @click.self="$emit('close')"
      >
        <div class="w-full max-w-sm rounded-2xl p-6 space-y-5" style="background: var(--surface); border: 1px solid var(--border)">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-semibold" style="color: var(--text)">登入 / 註冊</h2>
              <p class="text-xs mt-0.5" style="color: var(--text-3)">輸入 Email，我們會寄送登入連結</p>
            </div>
            <button class="p-1 rounded-lg" style="color: var(--text-3)" @click="$emit('close')">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Sent state -->
          <div v-if="authStore.magicLinkSent" class="text-center space-y-3 py-2">
            <div class="text-3xl">📬</div>
            <p class="text-sm font-medium" style="color: var(--text)">登入連結已寄出！</p>
            <p class="text-xs" style="color: var(--text-2)">請到 <span style="color: var(--gold)">{{ email }}</span> 的信箱點擊連結完成登入</p>
            <button class="text-xs" style="color: var(--text-3)" @click="authStore.magicLinkSent = false">重新輸入 Email</button>
          </div>

          <!-- Input state -->
          <template v-else>
            <div>
              <label class="stat-label block mb-1">Email</label>
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
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
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ show: boolean }>()
defineEmits<{ close: [] }>()

const authStore = useAuthStore()
const email = ref('')
const errorMsg = ref('')

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
