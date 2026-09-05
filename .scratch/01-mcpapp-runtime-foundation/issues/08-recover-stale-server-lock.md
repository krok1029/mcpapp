# 08 — 辨識並恢復 stale Server instance lock

**What to build:** 讓前一個 McpApp Server 未能 graceful shutdown、只留下 stale lock 時，新 Server 能查證原程序已不存在後安全接手，而不會因殘留鎖永久不可用或誤搶仍存活實例。

**Blocked by:** 07 — 阻止第二個 McpApp Server 實例

**Status:** ready-for-agent

- [ ] 異常終止 Server 並保留鎖狀態後，新實例能辨識可能的 stale lock。
- [ ] 新實例必須查證原 owner 不再存活，不能只依鎖檔時間或存在與否接手。
- [ ] 原 owner 仍存活或無法安全判斷時，新實例拒絕接手並回報可理解原因。
- [ ] 確認 stale 後，新實例安全取得 ownership 並保留既有 SQLite 資料。
- [ ] stale recovery 過程留下可檢查的 runtime 記錄，但不把鎖內部細節暴露成業務 contract。
- [ ] 多程序中斷測試完成 AC-027 的 stale lock 部分。
