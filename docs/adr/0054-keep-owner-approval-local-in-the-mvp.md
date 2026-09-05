# MVP 只允許本機專案擁有者核准

狀態：M0 不採用獨立 Owner Session；遠端存取前重新評估（見 ADR-0057）。

MVP 只允許從 loopback 控制介面建立 Owner Session、回應 Approval Challenge 及管理 Client Grant；Secure MCP Tunnel 不暴露這些端點。ChatGPT Pro 路徑可以查看待核准資訊，但不能遠端核准；Codex 遇到 Approval Gate 時暫停，直到專案擁有者透過 ADR-0055 定義的本機 Owner Console 完成確認，`basic-host` 的本機驗證路徑使用同一流程。

遠端 Client OAuth 只識別 Client Grant，不能作為專案擁有者的逐項 Approval Proof。這使 owner root credential 保持在本機並縮小 MVP 攻擊面，代價是專案擁有者離開執行 McpApp 的電腦後不能核准。未來加入完整遠端 write workflow 前，必須另行決定遠端 Owner authentication，不得透過放寬 Tunnel 或重用 Client OAuth 默認開啟。
