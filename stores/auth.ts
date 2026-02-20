export const useAuthStore = defineStore('auth', () => {
  const nuxtApp = useNuxtApp()
  const db = computed(() => (nuxtApp.$supabase as ReturnType<typeof import('@supabase/supabase-js').createClient> | undefined) ?? null)

  const user = ref<{ id: string; email?: string } | null>(null)
  const loading = ref(false)
  const magicLinkSent = ref(false)

  /** 初始化：還原 session 並監聽變化 */
  function init() {
    if (!db.value) return
    db.value.auth.getSession().then(({ data }) => {
      user.value = data.session?.user ? { id: data.session.user.id, email: data.session.user.email } : null
    })
    db.value.auth.onAuthStateChange((_event, session) => {
      const prev = user.value?.id
      user.value = session?.user ? { id: session.user.id, email: session.user.email } : null
      // 登入/登出時重新載入損益資料
      if (user.value?.id !== prev) {
        usePortfolioStore().init()
      }
    })
  }

  /** 發送 Magic Link */
  async function sendMagicLink(email: string): Promise<string | null> {
    if (!db.value) return '尚未設定 Supabase'
    loading.value = true
    magicLinkSent.value = false
    try {
      const { error } = await db.value.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) return error.message
      magicLinkSent.value = true
      return null
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    if (!db.value) return
    await db.value.auth.signOut()
    user.value = null
  }

  const isLoggedIn = computed(() => !!user.value)

  return { user, loading, magicLinkSent, isLoggedIn, init, sendMagicLink, signOut }
})
