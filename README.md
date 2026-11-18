# 🎡 Lucky Picker 幸運大輪盤

> 專為尾牙、春酒、活動抽籤設計的專業輪盤抽獎系統！支援自訂編號、名單批次匯入、各級獎項管理、旋轉音效與慶祝彩花特效。

🔗 **線上使用網址 (GitHub Pages)**: [https://tobytoy.github.io/lucky-picker/](https://tobytoy.github.io/lucky-picker/)

---

## ✨ 核心特色

1. **雙抽獎模式切換**：
   - 🎯 **抽參與者模式**：輪盤上為人員編號/名單，先選定目標獎項（如：頭獎），旋轉抽出得獎幸運兒。
   - 🎁 **抽獎項模式**：輪盤上為各大獎品（依剩餘名額呈現），人員依序上前旋轉抽獎。
2. **靈活的名單與編號管理**：
   - **一鍵快速生成**：支援指定起始號、結束號（例如 1 ~ 100）、前綴詞（如 `NO.`）與位數自動補零（`001`）。
   - **批次貼上匯入**：每行一人，支援純文字或 `編號,姓名` 格式。
   - **防重複中獎機制**：抽中後可一鍵「移出名單（排除已中獎）」，亦可選擇保留繼續抽。
   - 支援隨機打亂排序 (Shuffle)、搜尋與一鍵重置。
3. **精準獎項配額管理**：
   - 自訂獎項名稱、名額總數、專屬顏色與圖示。
   - 即時剩餘名額統計，名額抽完自動提示與切換。
4. **真實輪盤體驗與聲光效果**：
   - 物理旋轉緩動動畫（Ease-out Quartic）。
   - Web Audio API 擬真指針機械跳動音效 (Tick sound) 與慶祝歡呼和弦 (Fanfare)。
   - 全螢幕五彩紙花慶祝特效 (Confetti)。
   - 支援全螢幕簡報投影模式 (Fullscreen)，宴會大螢幕投影極致震撼！
5. **中獎歷史紀錄與匯出**：
   - 即時紀錄得獎時間、編號、姓名與獎項。
   - 一鍵匯出 CSV 檔案（支援 Excel 繁體中文 UTF-8 BOM，不亂碼）。
   - 支援「作廢重抽（還原資格與獎品數量）」。
6. **本機自動儲存**：
   - 所有名單、獎項、抽獎紀錄均自動儲存於瀏覽器 `localStorage`，重新整理或關閉分頁絕不遺失。

---

## 🚀 部署至 GitHub Pages 說明

### 1. 部署後網址
```
https://tobytoy.github.io/lucky-picker/
```

### 2. 需要在 GitHub 進行的設定（只需一次）：
1. 進入本專案的 GitHub 頁面：[https://github.com/tobytoy/lucky-picker/settings/pages](https://github.com/tobytoy/lucky-picker/settings/pages)
2. 找到 **Build and deployment** 區塊：
   - 將 **Source** 下拉選單改為 **GitHub Actions**。
3. 之後只要將程式碼推送到 `main` 分支，GitHub Actions 就會自動建置並發布到 GitHub Pages！

---

## 💻 本地端開發 (Local Development)

```bash
# 1. 安裝套件
npm install

# 2. 啟動本機開發伺服器
npm run dev

# 3. 測試打包
npm run build
```
