# 分離 Client 授權與專案擁有者核准

狀態：M0 不採用；遠端存取前重新評估（見 ADR-0057）。

Client Grant 的 work 權限只能讓 Host Agent 提出草稿並執行已核准範圍內的操作，不能代表專案擁有者跨越 Approval Gate；McpApp 不向 Host Agent 暴露通用 `approve` tool。每次核准由 Server 建立短效 Approval Challenge，綁定操作類型、目標 Artifact 或 Diff、Draft Revision 或內容雜湊、Client Grant、Work Session、受管專案與到期時間，再由專案擁有者透過獨立的 Owner Session 檢視並確認。

Server 直接把確認結果保存為單次、不可重放的 Approval Proof，不將可轉交的核准 token 回傳給 Agent。任何已綁定內容或 Revision 改變都令 Challenge 與尚未使用的 Proof 失效；強制接管、取消執行中工具與其他高風險操作遵循相同模式。Evidence 記錄核准對象、摘要、時間與結果，但不保存 credential。這增加 Owner Session 與 challenge/proof 流程，換取 Agent 即使持有 work Grant 也不能自我核准的安全邊界。

MVP 的 Owner Session 只能依 ADR-0054 從本機 loopback 控制介面建立及使用。
