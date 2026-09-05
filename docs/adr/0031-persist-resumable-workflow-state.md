# 將工作流設計為可中斷與可恢復

SQLite 中的工作流狀態是恢復依據，Host 對話不是。每次狀態轉移、核准與 Evidence metadata 必須交易式持久化，具副作用的 MCP Tool Call 使用 Idempotency Key；重啟時將未完成步驟標記為 `INTERRUPTED`，並先查證檔案、Git 與 GitHub 外部狀態後才能重試。Host Agent 透過 Resume Context 取得目前 Active Ticket、最後成功步驟、待處理閘門與 Repository 差異。
