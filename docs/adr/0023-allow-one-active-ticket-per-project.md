# 每個受管專案只允許一張 Active Ticket

MVP 在每個受管專案中只允許一張 Active Ticket，其他 Ticket 可以排隊，但必須等目前 Ticket 的 PR 合併，或關閉且完成後續處置，才能開始下一張。這避免第一版處理平行 Agent、Branch 衝突與跨 Ticket 工作樹污染；不同受管專案保持獨立，但單一 Host Agent 工作階段一次仍只操作一個專案。
