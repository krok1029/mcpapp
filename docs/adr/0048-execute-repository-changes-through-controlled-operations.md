# 透過受控 Repository 操作執行程式變更

McpApp Server 必須提供讀取、搜尋、套用 Patch、檢視 Git 狀態與 Diff 等窄介面的受控 Repository 操作，讓 ChatGPT 等不具本機檔案能力的 Host Agent 可以實際完成開發。操作只能作用於目前受管 Repository 與 Active Ticket 允許的範圍，必須驗證基準內容、防止路徑逸出、遵守刪除／移動／依賴變更的額外核准政策，並記錄輸入、結果、Git HEAD 與工作樹指紋。驗證與建置只允許執行 Stack Profile 已核准的命令，不提供任意 Shell。

Host Agent 仍負責理解需求、規劃修改與產生 Patch；McpApp 負責驗證並執行操作，因此 McpApp 是受控執行層而不是內嵌 AI Agent。具有自身檔案能力的 Host 仍需透過 Out-of-band Change 偵測納入或排除直接修改，不能繞過工作流取得完成狀態。
