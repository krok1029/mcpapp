# 06 — 關閉 Work Session 並驗證變更 handle

**What to build:** 讓專案擁有者或 Host 明確結束或放棄 Open Work Session，並讓所有作用於既有受管專案的變更型工具一致驗證 handle。純讀取與建立受管專案草稿的 bootstrap 操作保持可用，但缺少、未知、已關閉或專案不符的 Work Session 不能授權其他變更。

**Blocked by:** 03 — 為受管專案建立 Open Work Session

**Status:** needs-triage

- [ ] 純讀取工具在沒有 `work_session_id` 時仍可使用。
- [ ] 除建立受管專案草稿的 bootstrap 操作外，所有變更型工具拒絕缺少或未知的 `work_session_id`。
- [ ] Work Session 與請求的受管專案不符時拒絕操作。
- [ ] 只有明確的結束或放棄操作能把 Open Work Session 關閉，HTTP 中斷不會造成關閉。
- [ ] 已關閉 Work Session 的 handle 不能再次執行變更，但其歷史與 Evidence 保留可讀。
- [ ] 關閉後再次呼叫 `begin_or_resume_work` 會建立新的、不重用的 `work_session_id`。
- [ ] 公開 MCP Tool contract tests 覆蓋成功與拒絕路徑，完成 AC-004。
