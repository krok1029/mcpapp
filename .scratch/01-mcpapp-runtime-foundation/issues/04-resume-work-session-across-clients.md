# 04 — 跨 HTTP 重連與本機 Host 恢復 Work Session

**What to build:** 讓 Host 對已有 Open Work Session 的受管專案再次呼叫 `begin_or_resume_work` 時，無論 HTTP 重新連線、Project Console 重載或換成另一個本機 Client，都取得原本的 Work Session，而不是建立分叉工作。

**Blocked by:** 03 — 為受管專案建立 Open Work Session

**Status:** ready-for-agent

- [ ] 同一 Client 重複呼叫時取得相同 `work_session_id`。
- [ ] 中斷並建立新的 HTTP 連線後，仍取得相同 `work_session_id`。
- [ ] 第二個本機 Client 對同一受管專案呼叫時，仍取得相同 Open Work Session。
- [ ] HTTP transport session ID 與 Client metadata 只作 transport 或稽核資訊，不會建立新的權威 Work Session。
- [ ] Host 對話結束或 Project Console 重載不會關閉 Work Session。
- [ ] 整合測試透過多個 Streamable HTTP Client 證明 AC-001 的恢復部分與 AC-002。
