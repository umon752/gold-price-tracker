import type { TNewsItem } from '~/types/news'

export function getMockNews(): TNewsItem[] {
  const now = Date.now()
  const h = 3600 * 1000

  return [
    {
      id: '1',
      title: '聯準會暗示年內降息 國際金價上漲逾1%',
      summary: '美國聯準會官員釋出降息訊號，市場避險情緒升溫，推動國際黃金價格走高，現貨金突破每盎司2,400美元關卡。',
      source: '經濟日報',
      publishedAt: new Date(now - 2 * h).toISOString(),
      url: 'https://money.udn.com/money/story/5599/8026381',
      sentiment: 'positive',
    },
    {
      id: '2',
      title: '臺灣銀行調整黃金牌告價格',
      summary: '台銀公告最新黃金買入及賣出牌告價格，反映近期國際金價波動，投資人可依牌告價進行交易。',
      source: '工商時報',
      publishedAt: new Date(now - 5 * h).toISOString(),
      url: 'https://rate.bot.com.tw/gold',
      sentiment: 'neutral',
    },
    {
      id: '3',
      title: '中東局勢緊張 避險資產需求大幅上升',
      summary: '地緣政治風險升溫，投資人紛紛轉進黃金等避險資產，帶動金價短線急漲，分析師看好後市。',
      source: 'Reuters 中文版',
      publishedAt: new Date(now - 8 * h).toISOString(),
      url: 'https://www.reuters.com/markets/commodities/gold-prices-rise-middle-east-tensions/',
      sentiment: 'positive',
    },
    {
      id: '4',
      title: '美元走強壓制金價 短線回檔整理',
      summary: '美元指數走強，金價承壓回落。分析師指出，若美元維持強勢，金價短線恐面臨修正壓力。',
      source: 'Bloomberg 中文',
      publishedAt: new Date(now - 12 * h).toISOString(),
      url: 'https://www.bloomberg.com/news/articles/2024-01-15/gold-prices-dollar-strength',
      sentiment: 'negative',
    },
    {
      id: '5',
      title: '全球央行持續增購黃金 儲備量創歷史新高',
      summary: '世界黃金協會最新報告顯示，全球央行去年黃金儲備創下歷史紀錄，中國、印度等新興市場央行為主要買家。',
      source: 'World Gold Council',
      publishedAt: new Date(now - 18 * h).toISOString(),
      url: 'https://www.gold.org/goldhub/research',
      sentiment: 'positive',
    },
    {
      id: '6',
      title: '黃金 ETF 資金連續第三週淨流入',
      summary: '實物黃金 ETF 持倉量持續增加，機構投資人對黃金長期保值功能信心回升，推升市場需求。',
      source: '財訊',
      publishedAt: new Date(now - 24 * h).toISOString(),
      url: 'https://www.wealth.com.tw/home/articles/45672',
      sentiment: 'positive',
    },
    {
      id: '7',
      title: '通膨數據高於預期 黃金保值需求升溫',
      summary: '最新CPI數據顯示通膨仍具黏性，市場擔憂降息時程延後，資金轉入黃金以對抗通膨侵蝕。',
      source: '鉅亨網',
      publishedAt: new Date(now - 36 * h).toISOString(),
      url: 'https://news.cnyes.com/news/cat/gold',
      sentiment: 'positive',
    },
    {
      id: '8',
      title: '科技股大幅回調 資金轉進貴金屬',
      summary: '那斯達克指數大跌逾2%，市場風險情緒降溫，資金從科技股流出，轉進黃金、白銀等貴金屬。',
      source: 'MoneyDJ',
      publishedAt: new Date(now - 48 * h).toISOString(),
      url: 'https://www.moneydj.com/kline/xdjkline.djhtm?a=GC00',
      sentiment: 'positive',
    },
    {
      id: '9',
      title: '分析師：黃金今年有望挑戰每盎司2,500美元',
      summary: '多位華爾街分析師上調黃金目標價，認為降息預期、央行購金及地緣風險三重因素將支撐金價再創高點。',
      source: 'Goldman Sachs Research',
      publishedAt: new Date(now - 60 * h).toISOString(),
      url: 'https://www.goldmansachs.com/intelligence/pages/gold.html',
      sentiment: 'positive',
    },
    {
      id: '10',
      title: '印度黃金進口關稅調整 影響亞洲需求',
      summary: '印度政府宣布調整黃金進口關稅政策，業界預估短期將影響亞洲實物黃金需求，金價面臨下行壓力。',
      source: '聯合財經網',
      publishedAt: new Date(now - 72 * h).toISOString(),
      url: 'https://money.udn.com/money/story/5599/8031205',
      sentiment: 'negative',
    },
  ]
}
