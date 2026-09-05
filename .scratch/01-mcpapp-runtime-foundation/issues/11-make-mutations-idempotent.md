# 11 — 讓具副作用操作可冪等重試

**What to build:** 讓所有具副作用的 MCP Tool Call 使用持久化 Idempotency Key。呼叫端在網路結果不明時可以安全重送相同請求，而不會重複建立 Work Session、重複修改狀態或產生第二份副作用。

**Blocked by:** 10 — 釋放 Mutation Guard 並重新驗證重試

**Status:** ready-for-agent

- [ ] 每個具副作用的工具請求都要求符合格式的 Idempotency Key。
- [ ] 第一次請求會持久保存 key、canonical payload identity、操作狀態與結果。
- [ ] 相同 key 與相同 payload 重送時回傳已保存結果，不再次執行 application command。
- [ ] 相同 key 搭配不同 payload 或不同操作時被明確拒絕。
- [ ] 冪等紀錄在 Server 重啟後仍生效。
- [ ] 並行送出相同 key 時最多只有一個請求執行副作用，其餘取得一致結果或明確進行中狀態。
- [ ] Streamable HTTP tests 以可觀察副作用次數證明 retry safety，不測私有 cache 實作。
