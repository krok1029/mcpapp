# 09 — 競爭變更立即回傳 PROJECT_BUSY

**What to build:** 讓同一受管專案已有變更操作時，第二個變更請求立即得到 `PROJECT_BUSY` 與可理解的目前操作摘要，而不是排隊、並行執行或等待至逾時；其他受管專案不受影響。

**Blocked by:** 06 — 關閉 Work Session 並驗證變更 handle

**Status:** ready-for-agent

- [ ] 第一個有效 Work Session 變更操作執行期間會持有該受管專案的 Mutation Guard。
- [ ] 第二個對同一受管專案的變更請求立即回傳穩定的 `PROJECT_BUSY` domain error。
- [ ] `PROJECT_BUSY` 包含目前操作種類與開始時間等安全摘要，不洩漏 payload 或 credential。
- [ ] 競爭請求不會排隊，也不會執行任何部分副作用。
- [ ] 同一時間對另一個受管專案的合法變更不會被全域阻擋。
- [ ] 以可控制完成時點的公開 HTTP 變更操作測試 single-flight 行為，完成 AC-028。
