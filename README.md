<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: My Module
- Package name: my-module
- Description: My new Nuxt module
-->

# My Module

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

My new Nuxt module for doing amazing things.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/my-module?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->
- ⛰ &nbsp;Foo
- 🚠 &nbsp;Bar
- 🌲 &nbsp;Baz

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxt module add my-module
```

That's it! You can now use My Module in your Nuxt app ✨


## TypeScript 規範

### 命名規則

- **`type`** 優先使用，命名前綴為 `T`
  ```ts
  type TUser = {
    id: number
    name: string
  }

  type TApiResponse<T> = {
    data: T
    status: number
    message: string
  }
  ```

- **`interface`** 用於需要擴展（`extends`）或合併宣告的場景，命名前綴為 `I`
  ```ts
  interface IUser {
    id: number
    name: string
  }

  interface IAdminUser extends IUser {
    role: string
  }
  ```

### 使用原則

| 場景 | 建議 |
|------|------|
| 一般物件、聯合型別、交叉型別 | 使用 `type`（前綴 `T`） |
| 需要 `extends` 繼承或宣告合併 | 使用 `interface`（前綴 `I`） |
| Props / Emits 型別定義 | 使用 `type`（前綴 `T`） |
| 第三方套件擴展（augmentation） | 使用 `interface`（前綴 `I`） |

### 範例

```ts
// ✅ 正確
type TGoldPrice = {
  date: string
  price: number
  currency: string
}

type TApiResult<T> = {
  data: T
  error: string | null
}

interface IGoldPriceService {
  fetchPrice(date: string): Promise<TGoldPrice>
}

// ❌ 避免
type goldPrice = { ... }   // 缺少前綴 T
interface GoldPrice { ... } // 缺少前綴 I
```

---

## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/my-module/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/my-module

[npm-downloads-src]: https://img.shields.io/npm/dm/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/my-module

[license-src]: https://img.shields.io/npm/l/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/my-module

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
