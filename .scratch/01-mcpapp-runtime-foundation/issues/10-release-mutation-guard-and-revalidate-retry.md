# 10 — 釋放 Mutation Guard 並重新驗證重試

**What to build:** 讓 Mutation Guard 在變更操作成功或失敗後都立即釋放，並要求先前收到 `PROJECT_BUSY` 的呼叫端重新讀取最新權威狀態再重試，避免以過期 Draft Revision、Git HEAD 或工作樹指紋覆寫新結果。

**Blocked by:** 09 — 競爭變更立即回傳 PROJECT_BUSY

**Status:** ready-for-agent

- [ ] 變更操作成功後立即釋放該受管專案的 Mutation Guard。
- [ ] 變更操作以預期 domain error 或非預期失敗結束後也會釋放 Guard。
- [ ] Guard 釋放後，新的合法請求不需要人工解除或等待 lease timeout。
- [ ] `PROJECT_BUSY` 回應指示呼叫端重新讀取權威狀態，而不是盲目重送原請求。
- [ ] 使用舊 Draft Revision、Git HEAD 或工作樹指紋重試時，Server 拒絕 stale write。
- [ ] 使用重新讀取的最新狀態重試時可以正常進入變更操作。
- [ ] 公開 HTTP integration tests 覆蓋成功、失敗、stale retry 與 fresh retry，完成 AC-029。
