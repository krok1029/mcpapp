# 將每張 Ticket 發布為一個 GitHub PR

MVP 只支援 GitHub。McpApp 經核准後建立本機 Repository 與預設為 Private 的 GitHub Repository；一張 Ticket 使用一個 Branch，可包含多個小型 Commit，並恰好對應一個 PR。完整 Ticket 通過累積 Diff Review 後，專案擁有者必須核准 remote、branch、Commit、Diff、PR 標題、固定格式內文及受控的類型與風險 Label，Agent 才能 Push 並建立 PR；實際發布內容與 Label 會保存至開發證據鏈。Agent 可以更新 PR，但不負責 Merge；只有專案擁有者合併 PR，且 McpApp 記錄 Merge Commit 後，Ticket 才算完成。Force Push、Reset、Clean、Rebase 與 Repository 外寫入仍禁止。
