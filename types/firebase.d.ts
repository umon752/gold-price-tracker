import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

declare module '#app' {
  interface NuxtApp {
    $firebaseAuth?: Auth
    $firestore?: Firestore
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $firebaseAuth?: Auth
    $firestore?: Firestore
  }
}

export {}
