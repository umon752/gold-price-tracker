# 🪙 黃金金價趨勢分析應用程式 (Gold Price Tracker)

## 📌 專案概述

一款針對台灣投資者的黃金金價趨勢分析 Web 應用程式，整合**台灣銀行黃金牌價**即時數據、**國際金價相關新聞**，以及**個人黃金投資損益追蹤**功能。

---

## 🛠 技術架構

| 項目 | 技術選型 | 說明 |
| --- | --- | --- |
| 框架 | Nuxt 3 + TypeScript | Vue 全端框架，內建 SSR / SSG |
| UI 框架 | Tailwind CSS + Nuxt UI | 現代化 UI 元件庫 |
| 圖表 | ECharts (vue-echarts) | 功能強大的互動式圖表 |
| 狀態管理 | Pinia | Vue 官方狀態管理 |
| 資料請求 | useFetch / useAsyncData (Nuxt 內建) | 內建資料請求與快取 |
| 路由 | 檔案式路由 (Nuxt 內建) | 自動產生路由 |
| 後端 API | Nitro Server Engine (Nuxt 內建) | server/api/ 目錄即 API |
| 本地儲存 | LocalStorage / IndexedDB | 持久化使用者投資記錄 |
| 日期處理 | Day.js | 輕量日期工具 |
| 國際化 | @nuxtjs/i18n (可選) | 未來支援多語系 |

---

## 📐 功能模組規劃

### 模組一：黃金金價走勢圖表 📈

**數據來源：台灣銀行黃金牌價**

- 顯示每日台灣銀行黃金**買入價 / 賣出價**（新台幣/克）
- 支援時間範圍切換：
  - **日** — 當日即時牌價（每小時更新）
  - **週** — 近 7 天走勢
  - **月** — 近 30 天走勢
  - **年** — 近 365 天走勢
- 圖表互動功能：
  - 滑鼠 hover 顯示詳細資訊（日期、買入價、賣出價）
  - 縮放 & 拖曳瀏覽歷史數據
  - 最高/最低價標記
  - 均線指標（MA5 / MA20）
- 關鍵數據摘要卡片：
  - 今日買入/賣出價
  - 日漲跌幅（金額 & 百分比）
  - 近 7 天 / 30 天漲跌幅

**數據取得策略：**
- 透過 Nuxt Server API（server/api/）抓取台灣銀行網頁牌價，天然解決 CORS
- 備用方案：串接第三方金價 API（如 GoldAPI.io、Metals API）
- 前端使用 Nuxt 內建 useFetch / useAsyncData 做資料快取，減少重複請求

---

### 模組二：國際黃金新聞 📰

**每日自動整理 3 篇黃金金價相關國際新聞**

- 新聞來源策略：
  - 主要：NewsAPI.org（免費方案每日 100 次請求）
  - 備用：Google News RSS Feed 解析
  - 搜尋關鍵字：`gold price`、`黃金`、`XAUUSD`、`Fed interest rate`
- 新聞卡片顯示：
  - 標題（可點擊連結至原文）
  - 來源媒體 & 發布時間
  - 摘要內容（150 字內）
  - 縮圖（如有）
  - AI 情緒標籤：🟢 利多 / 🔴 利空 / 🟡 中性（可選進階功能）
- 每日自動更新，支援手動重新整理
- 新聞列表可捲動瀏覽歷史

---

### 模組三：個人黃金投資損益報表 💰

**追蹤使用者黃金持倉與損益**

- **投資記錄管理：**
  - 新增買入記錄：日期、克數、買入單價（自動帶入當日牌價或手動輸入）
  - 新增賣出記錄：日期、克數、賣出單價
  - 編輯 / 刪除歷史記錄
- **損益計算：**
  - 目前持有總克數
  - 平均買入成本（TWD/克）
  - 目前市值（依最新賣出牌價計算）
  - 未實現損益 = 目前市值 - 總買入成本
  - 未實現報酬率 (%)
  - 已實現損益（已賣出部分）
- **損益報表視覺化：**
  - 持倉損益走勢圖（折線圖）
  - 買入/賣出點位標記於金價走勢上
  - 月度損益柱狀圖
  - 圓餅圖：已實現 vs 未實現損益佔比
- **數據儲存：**
  - 使用 LocalStorage 持久化（輕量方案）
  - 未來可擴展至雲端同步（Firebase / Supabase）

---

## 📁 專案結構

```
gold-price-tracker/
├── public/                          # 靜態資源
├── assets/                          # 需編譯的資源（圖片、全域樣式）
├── components/                      # 共用元件（自動匯入）
│   ├── Chart/                       #   圖表元件
│   │   ├── GoldPriceChart.vue
│   │   └── ProfitChart.vue
│   ├── NewsCard/                    #   新聞卡片
│   │   └── NewsCard.vue
│   ├── TradeForm/                   #   交易表單
│   │   └── TradeForm.vue
│   ├── Layout/                      #   佈局元件
│   │   ├── AppHeader.vue
│   │   └── AppFooter.vue
│   └── UI/                          #   基礎 UI 元件
│       ├── PriceCard.vue
│       └── TimeRangeSelector.vue
├── composables/                     # 組合式函式（自動匯入）
│   ├── useGoldPrice.ts              #   金價數據
│   ├── useNews.ts                   #   新聞數據
│   └── usePortfolio.ts             #   投資組合
├── pages/                           # 頁面（檔案式路由）
│   ├── index.vue                    #   首頁儀表板
│   ├── chart.vue                    #   金價走勢詳細頁
│   ├── news.vue                     #   新聞列表頁
│   └── portfolio.vue                #   投資組合損益頁
├── stores/                          # Pinia 狀態管理
│   ├── priceStore.ts                #   金價狀態
│   └── portfolioStore.ts           #   投資組合狀態
├── services/                        # 前端 API 呼叫封裝
│   ├── goldPriceService.ts
│   └── newsService.ts
├── server/                          # Nitro 後端 API
│   ├── api/
│   │   ├── gold-price.ts            #   取得台銀金價（代理爬取）
│   │   └── news.ts                  #   取得國際新聞
│   └── utils/
│       └── crawler.ts               #   台銀網頁爬取工具
├── types/                           # TypeScript 型別定義
│   ├── gold.ts
│   ├── news.ts
│   └── portfolio.ts
├── utils/                           # 工具函式
│   ├── calculation.ts               #   損益計算
│   ├── format.ts                    #   格式化（金額、日期）
│   └── storage.ts                   #   本地儲存工具
├── app.vue                          # 根元件
├── nuxt.config.ts                   # Nuxt 設定檔
├── tailwind.config.ts               # Tailwind 設定
├── tsconfig.json
├── .env                             # 環境變數（API Keys）
├── package.json
└── README.md
```

---

## 🖥 頁面設計規劃

### 頁面 1：Dashboard 首頁儀表板
```
┌──────────────────────────────────────────────┐
│  🪙 黃金金價趨勢分析          [日][週][月][年] │
├──────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │ 今日買入 │ │ 今日賣出 │ │ 日漲跌幅 │        │
│  │ 2,850   │ │ 2,870   │ │ ▲ +0.5% │        │
│  └─────────┘ └─────────┘ └─────────┘        │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │         金價走勢圖（ECharts）          │    │
│  │         📈 互動式折線圖               │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌─ 今日國際新聞 ──────┐ ┌─ 我的持倉摘要 ──┐ │
│  │ 📰 新聞 1           │ │ 持有：50 克     │ │
│  │ 📰 新聞 2           │ │ 成本：142,500   │ │
│  │ 📰 新聞 3           │ │ 市值：143,500   │ │
│  │                     │ │ 損益：+1,000    │ │
│  └─────────────────────┘ └────────────────┘ │
└──────────────────────────────────────────────┘
```

### 頁面 2：金價走勢詳細頁
- 全螢幕互動式圖表
- 時間範圍選擇器
- 技術指標切換（MA5/MA20）
- 數據表格（可匯出 CSV）

### 頁面 3：國際新聞頁
- 新聞卡片瀑布流
- 日期篩選
- 關鍵字搜尋

### 頁面 4：投資組合損益頁
- 新增交易記錄表單
- 交易歷史列表
- 損益圖表（走勢圖 + 柱狀圖）
- 匯出報表功能

---

## 🔗 API 規劃

| API | 用途 | 來源 |
| --- | --- | --- |
| 台灣銀行牌價 | 取得每日黃金買入/賣出價 | 台銀網頁爬取 or 第三方 |
| NewsAPI | 搜尋國際黃金相關新聞 | newsapi.org |
| GoldAPI (備用) | 國際金價 XAUUSD | goldapi.io |

**CORS 處理方案：**
- Nuxt 3 內建 Nitro Server Engine，直接在 `server/api/` 撰寫後端 API
- 台銀金價爬取與 NewsAPI 請求皆在 Server 端執行，無 CORS 問題
- 部署至 Vercel / Netlify 時自動轉為 Serverless Functions

---

## 🚀 開發階段規劃

### Phase 1：基礎建設
- 使用 `npx nuxi@latest init` 初始化 Nuxt 3 專案
- 安裝並設定 Tailwind CSS + Nuxt UI
- 設定 Pinia 狀態管理
- 建立共用 Layout 元件（app.vue + components/Layout/）

### Phase 2：金價圖表模組
- 在 `server/api/gold-price.ts` 實作台銀金價爬取
- 安裝 vue-echarts，實作折線圖元件
- 實作日/週/月/年切換功能
- 建立摘要卡片元件

### Phase 3：國際新聞模組
- 在 `server/api/news.ts` 串接 NewsAPI
- 實作新聞卡片元件
- 實作每日自動抓取邏輯
- 新聞列表頁面

### Phase 4：投資損益模組
- 設計交易記錄資料結構
- 實作新增/編輯/刪除交易
- 實作損益計算邏輯
- 損益報表圖表

### Phase 5：優化與部署
- RWD 響應式設計調整
- 效能優化（Nuxt 內建 Lazy Component、快取策略）
- 部署至 Vercel / Netlify
- PWA 支援（@vite-pwa/nuxt 可選）

---

## 🔒 資安規劃

### 1. API Key 保護
- 所有第三方 API Key（NewsAPI、GoldAPI）僅存放於 `.env`，**不加 `NUXT_PUBLIC_` 前綴**
- 確保 Key 只在 `server/` 目錄下使用，永遠不會暴露至前端 Bundle
- `.env` 加入 `.gitignore`，提供 `.env.example` 作為範本（僅含 Key 名稱，不含值）

### 2. Server API 安全
- **Rate Limiting**：在 `server/middleware/` 加入速率限制，防止 API 被濫用
  - 建議：每 IP 每分鐘最多 30 次請求（可用 `h3` 內建功能或 `unstorage` 計數）
- **輸入驗證**：所有 Server API 的 query / body 參數使用 `zod` 做 Schema 驗證
  - 如 `range` 參數僅允許 `'day' | 'week' | 'month' | 'year'`
- **錯誤處理**：統一錯誤回應格式，避免洩漏內部實作細節（堆疊追蹤、檔案路徑等）
- **超時控制**：台銀爬取設定請求超時（如 10 秒），避免 Server 被拖垮

### 3. XSS 防護
- 新聞標題與摘要內容來自外部，**禁止使用 `v-html`** 直接渲染
- 若必須渲染 HTML，使用 `sanitize-html` 或 `DOMPurify` 過濾後才渲染
- Nuxt 預設的 Vue 模板綁定 `{{ }}` 已自動轉義，維持此行為不覆寫

### 4. Content Security Policy (CSP)
- 在 `nuxt.config.ts` 設定安全 HTTP Headers：
  ```ts
  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; connect-src 'self' https:;"
      }
    }
  }
  ```

### 5. 使用者資料保護（投資記錄）
- LocalStorage 中的投資記錄屬敏感財務資料，應做**加密儲存**
  - 使用 `crypto-js` AES 加密，Key 由使用者自設密碼衍生（PBKDF2）
  - 或提供「匯出加密備份 / 匯入還原」功能
- 未來若上雲端同步，須走 HTTPS + 使用者驗證（OAuth / Email OTP）

### 6. 依賴套件安全
- 使用 `npm audit` 定期檢查已知漏洞
- 在 CI/CD 加入 `npm audit --audit-level=high` 檢查
- 鎖定版本：確保 `package-lock.json` 納入版控

### 7. 爬蟲安全
- 台銀爬取在 Server 端執行，設定合理的 **User-Agent** 與**請求間隔**
- 實作 Server 端快取（如 `cachedEventHandler`），同一數據 **15 分鐘內不重複爬取**
- 避免被封鎖：不併發請求、不繞過 robots.txt 限制

---

## 📁 更新專案結構（資安相關新增）

```
server/
├── api/
│   ├── gold-price.ts        # 金價 API（含 zod 驗證）
│   └── news.ts              # 新聞 API（含 zod 驗證）
├── middleware/
│   └── rateLimit.ts         # 速率限制中介層
└── utils/
    ├── crawler.ts           # 台銀爬取（含超時 & 快取）
    └── sanitize.ts          # 外部內容清理工具
```

---

## 📝 注意事項

1. **台灣銀行數據抓取**：台銀沒有官方 API，需透過網頁爬取，注意頻率限制
2. **NewsAPI 免費限制**：免費方案每日 100 次，需做好快取
3. **數據持久化**：初期用 LocalStorage（加密儲存），資料量大時遷移至 IndexedDB
4. **時區處理**：所有時間以 Asia/Taipei (UTC+8) 為準
5. **金額精度**：使用整數運算避免浮點數誤差（以「分」為單位儲存）
6. **敏感資料**：API Key 絕不進版控、投資記錄加密儲存、外部內容一律消毒
