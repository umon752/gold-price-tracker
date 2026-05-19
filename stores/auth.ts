import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  type Auth,
} from 'firebase/auth'

const EMAIL_FOR_SIGN_IN_KEY = 'gold_email_for_sign_in'

export const useAuthStore = defineStore('auth', () => {
  const nuxtApp = useNuxtApp()
  const auth = computed(() => (nuxtApp.$firebaseAuth as Auth | undefined) ?? null)

  const user = ref<{ id: string; email?: string } | null>(null)
  const loading = ref(false)
  const magicLinkSent = ref(false)
  const initialized = ref(false)

  /** 初始化：處理 Email Link 登入、還原 session 並監聽變化 */
  async function init() {
    if (!auth.value || initialized.value) return
    initialized.value = true

    await completeEmailLinkSignIn()

    onAuthStateChanged(auth.value, (firebaseUser) => {
      const prev = user.value?.id
      user.value = firebaseUser ? { id: firebaseUser.uid, email: firebaseUser.email ?? undefined } : null
      if (user.value?.id !== prev) {
        void usePortfolioStore().init()
      }
    })
  }

  async function completeEmailLinkSignIn(): Promise<string | null> {
    if (!auth.value || !isSignInWithEmailLink(auth.value, window.location.href)) return null

    loading.value = true
    try {
      let email = localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY)
      if (!email) {
        email = window.prompt('請輸入您用來登入的 Email，以完成驗證') ?? ''
      }
      if (!email) return '缺少 Email，無法完成登入'

      await signInWithEmailLink(auth.value, email, window.location.href)
      localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY)
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname)
      return null
    } catch (e) {
      console.error('[auth] Email Link 登入失敗', e)
      return e instanceof Error ? e.message : '登入失敗，請重新寄送登入連結'
    } finally {
      loading.value = false
    }
  }

  /** 發送 Magic Link */
  async function sendMagicLink(email: string): Promise<string | null> {
    if (!auth.value) return '尚未設定 Firebase'
    loading.value = true
    magicLinkSent.value = false
    try {
      await sendSignInLinkToEmail(auth.value, email, {
        url: window.location.href,
        handleCodeInApp: true,
      })
      localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email)
      magicLinkSent.value = true
      return null
    } catch (e) {
      console.error('[auth] 寄送登入連結失敗', e)
      return e instanceof Error ? e.message : '寄送登入連結失敗'
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    if (auth.value) {
      await firebaseSignOut(auth.value)
    }
    user.value = null
  }

  const isLoggedIn = computed(() => !!user.value)

  return { user, loading, magicLinkSent, isLoggedIn, init, sendMagicLink, signOut }
})
