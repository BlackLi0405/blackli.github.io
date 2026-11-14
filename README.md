# BlackLi Board

把複雜的事寫在黑板上：分清楚事實、觀點、立場與利益，用幾分鐘看懂。

網站：https://blackli0405.github.io/blackli.github.io/

_最後更新：2026-11-15_

---

## 目前進度

### 已完成

- **網站改版**（2026-11-15）：新配色與標誌、共用頁首／選單／頁尾（`tools/site_chrome.py`）、各類文章範本、圖卡產生器（`tools/render.py`）。
- **首頁「今天的課表」**：自動讀取最新卡片，顯示四堂課（財經早報、國際早報、台股盤後、美股盤前）與「筆記本」區（生活、科技、社會、身心、深度拆解各取最新一篇）。
- **每日早報**：已發佈 2026-11-12、11-13、11-14 的財經早報與國際早報（`reports/`），IG 限動圖卡設定檔在 `tools/`。
- **今日小考**：`data/quiz.json`，首頁與「輕鬆」頁可作答（目前有 11-14 一份）。
- **工具頁**：出遊情報（`travel.html`）、幫我排行程（`trip.html`）、理財小工具（`calc.html`）。
- **關於頁**：關於小曹、我怎麼拆解資訊、來源原則、免責聲明。
- **裝到手機（App）**（2026-11-15）：網站可以加到手機主畫面，像 App 一樣全螢幕打開；讀過的文章沒網路也能看。安裝教學在 `app.html`（工具頁與頁尾都有連結），Android／電腦會出現「一鍵安裝」按鈕。

### 已建好、等第一篇內容

| 頁面 | 內容 | 第一篇預計 |
| --- | --- | --- |
| `weekly.html` | 生活／科技／社會週報 | 2026-11-15（日） |
| `mind.html` | 身心專欄 | 2026-11-15（日） |
| `fun.html` | 本週冷知識 | 2026-11-21（六） |
| `index.html` | 台股盤後 | 2026-11-16（一） |
| `index.html` | 美股盤前 | 2026-11-16（一） |
| `deep.html` | 深度拆解 | 尚未排定 |

### 待辦

- [ ] 深度拆解（`deep.html`）還沒有固定的更新排程。
- [ ] 確認週日第一次專欄、週一第一次盤後／盤前發佈後版面正常。
- [ ] 用 iPhone 與 Android 實際加到主畫面測一次。
- [ ] （之後再評估）推播通知、上架 App Store／Google Play。

---

## 更新排程（台灣時間）

| 時間 | 頻率 | 內容 | 發佈位置 |
| --- | --- | --- | --- |
| 07:45 | 每天 | 財經早報＋國際早報（各一則拆解＋兩則快訊）、IG 限動圖卡（財經 4 張、國際 1 張）、今日小考 3 題 | `reports/YYYY-MM-DD.html`、`reports/world-YYYY-MM-DD.html`、`data/quiz.json`、首頁 |
| 16:07 | 週一～週五（台股休市暫停） | 台股盤後：加權指數、三大法人、亞洲股市收盤，圖卡 1 張 | `reports/close-YYYY-MM-DD.html`、首頁 |
| 20:43 | 週一～週五（美股休市暫停） | 美股盤前：今晚數據與事件、期貨表現，圖卡 1 張 | `reports/pre-YYYY-MM-DD.html`、首頁 |
| 週六 10:17 | 每週 | 輕鬆：本週冷知識，圖卡 1 張 | `reports/fun-YYYY-MM-DD.html`、`fun.html` |
| 週日 10:13 | 每週 | 專欄四篇：生活、科技、社會週報＋身心專欄 | `reports/life-`／`tech-`／`society-`／`mind-YYYY-MM-DD.html`、`weekly.html`、`mind.html` |

首頁課表顯示的上課時間：早報 07:45、盤後 16:30、盤前 21:00；週末盤後與盤前顯示「休市」。

---

## 檔案結構

```
index.html        首頁（今天的課表），文章卡片放在 REPORTS／WORLD 標記之間
news.html         新聞（財經＋國際）
finance.html      財經早報列表
world.html        國際早報列表
weekly.html       專欄（LIFE／TECH／SOCIETY 標記）
mind.html         身心（MIND 標記）
deep.html         深度拆解（DEEP 標記）
fun.html          輕鬆・下課十分鐘（FUN 標記）＋今日小考
tools.html        工具總覽；travel.html、trip.html、calc.html
about.html        關於；method.html 拆解方法與來源原則
app.html          裝到手機（安裝教學）；offline.html 沒網路時顯示的頁面
manifest.webmanifest  App 名稱、圖示、顏色設定
sw.js             離線功能（網頁先抓最新、沒網路才用手機裡的版本；改快取規則時把 VERSION 加 1）
reports/          所有文章
data/quiz.json    今日小考（保留最近 14 天）
assets/           logo.svg、site.js（含 App 安裝按鈕）、icons/（App 圖示）
site.css          全站樣式與配色變數
tools/            文章範本（brief／close／pre／deep／mind／fun）、render.py、site_chrome.py（共用頁首含 App 設定，改完重跑）、圖卡設定檔
```

## 寫作原則

- 只寫有來源的內容，數字與日期都要在原始來源確認。
- 分清楚事實、觀點、立場、利益；未證實消息標明「據報導」「尚未獲官方證實」。
- 政治與爭議議題平衡呈現各方說法，不加入個人評價。
- 財經內容不預測漲跌、不給投資建議。
- 全站繁體中文（台灣用語），手機 390px 寬不可水平捲動。
