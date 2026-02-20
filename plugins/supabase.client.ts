import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl
  const key = config.public.supabaseAnonKey
  if (!url || !key) return  // 未設定環境變數時跳過
  const supabase = createClient(url, key)
  return { provide: { supabase } }
})
