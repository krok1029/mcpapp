# 使用單一啟用的 Storage Backend

M0 與其後續 MVP Milestones 只以內嵌 SQLite 保存工作流、Artifact、Evidence 與知識圖譜，並透過明確的 Storage 邊界避免核心流程依賴特定資料庫。MVP 不實作、部署或測試 PostgreSQL Backend，也不進行雙寫或持續同步。未來若需求成立，可以提供一次性 Migration，將資料移至 Supabase PostgreSQL 並改以它作為唯一工作流事實來源；屆時必須另行決策與驗收，且不預設採用 Supabase Auth、Storage 或 Realtime。
