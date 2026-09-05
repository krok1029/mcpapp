# 執行資料不進入 McpApp 原始碼 Repository

開發期間 SQLite、Evidence 與匯出檔案存放於 gitignored 的 `McpApp/.data/`；正式安裝預設使用作業系統的使用者應用資料目錄，並允許專案擁有者指定其他資料路徑。變更路徑時，McpApp 停止新工作、複製資料、驗證檔案數量、大小與雜湊後才切換，原目錄保留至擁有者另行確認刪除；目的地已有 McpApp 資料時 MVP 拒絕自動合併。原始碼與設計文件保留在 McpApp Repository，但可能含本機路徑或敏感輸出的執行資料不得被誤 Commit。

SQLite 與工作流狀態由 ADR-0050 所定義的單一 McpApp Server 實例存取；資料位置的生命週期仍遵守本 ADR。
