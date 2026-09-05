# M0 使用 single-flight Mutation Guard

狀態：取代 ADR-0050 中 M0 的 Workflow Lease 設計。

M0 每個受管專案同時只執行一項變更型工具；Mutation Guard 不區分加入同一 Open Work Session 的 Codex 與 Project Console。第二個變更請求立即回傳 `PROJECT_BUSY` 與目前操作摘要，不進入佇列；呼叫端必須等操作結束後重新讀取 Draft Revision、Git HEAD 與工作樹指紋，再自行重試。Guard 在操作成功或失敗後立即釋放，不使用 heartbeat、租約逾時或人工接管。

Server 異常終止後，必須以持久操作紀錄、工作流狀態與 Repository 指紋判斷是否留下部分結果，不得假裝未執行。Draft Revision、內容雜湊與 Git 指紋繼續拒絕 stale write。Workflow Lease 延至允許多個 Open Work Session 或遠端 Client 時重新決定；這以較少狀態處理 M0 真正存在的同一 Work Session 多 Host 競爭。
