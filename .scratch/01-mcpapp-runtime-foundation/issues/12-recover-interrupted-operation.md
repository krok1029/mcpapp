# 12 — 從中斷操作辨識並恢復部分結果

**What to build:** 讓 McpApp Server 在具副作用操作執行途中異常終止後，於重新啟動時如實標示中斷、查證可能的部分結果，並透過 Resume Context 告訴 Host 如何安全續作；系統不能假裝操作未發生，也不能自動重複未知副作用。

**Blocked by:** 05 — Server 重啟後提供 Resume Context；08 — 辨識並恢復 stale Server instance lock；11 — 讓具副作用操作可冪等重試

**Status:** ready-for-agent

- [ ] 具副作用操作開始前持久保存 `IN_PROGRESS` 操作紀錄及 Idempotency Key。
- [ ] Server 重啟時將沒有終止結果的操作辨識並標記為 `INTERRUPTED`。
- [ ] 復原流程比較可用的工作流狀態、持久操作紀錄，以及適用的 Repository 或外部結果指紋。
- [ ] 已確認完成的外部結果可以連回原操作，不重複執行副作用。
- [ ] 無法確認結果時保持 `INTERRUPTED` 並要求明確處置，不推測成功或失敗。
- [ ] Resume Context 顯示中斷操作、已知部分結果、目前阻擋狀態與允許的安全下一步。
- [ ] Mutation Guard 不會因舊程序消失而永久占用，但新變更不能繞過未處置中斷狀態。
- [ ] 以真實程序中止與重啟的整合測試完成 AC-003 的中斷恢復部分與 AC-030。
