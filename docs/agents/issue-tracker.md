# Issue tracker：本機 Markdown

本專案的 Issue 與 Spec（亦可稱為 PRD）以 Markdown 檔案保存在 `.scratch/`。

## 檔案慣例

- 每項功能使用一個目錄：`.scratch/<feature-slug>/`
- Spec 位於 `.scratch/<feature-slug>/spec.md`
- 每張實作 Ticket 使用獨立檔案：`.scratch/<feature-slug>/issues/<NN>-<slug>.md`
- Ticket 從 `01` 開始編號，不得將多張 Ticket 合併成單一檔案
- 在 Issue 檔案頂部附近使用 `Status:` 記錄分流狀態
- 留言與討論紀錄附加於檔案底部的 `## Comments` 段落

## 當 skill 要求「發布至 issue tracker」

在 `.scratch/<feature-slug>/` 下建立新檔案；如果目錄不存在，先建立目錄。

## 當 skill 要求「取得相關 Ticket」

讀取使用者指定路徑或編號所對應的 Ticket 檔案。

## Wayfinding 操作

每項工作包含一份 Map，並為每張 Ticket 建立一個子檔案。

- Map：`.scratch/<effort>/map.md`
- 子 Ticket：`.scratch/<effort>/issues/NN-<slug>.md`
- Ticket 類型：使用 `Type:` 記錄 `research`、`prototype`、`grilling` 或 `task`
- Ticket 狀態：使用 `Status:` 記錄 `claimed` 或 `resolved`
- 阻擋關係：在檔案頂部附近使用 `Blocked by: NN, NN`
- Frontier：依編號選取第一張尚未解決、未被阻擋且未被認領的 Ticket
- 認領：開始工作前將狀態設為 `Status: claimed` 並保存
- 完成：在 `## Answer` 下附加答案，將狀態改為 `Status: resolved`，再把摘要與連結寫入 Map 的決策紀錄
