# 分離實作與 Review Run

MVP 由同一個 Host Agent 執行實作與 Review，但 Review 必須是獨立執行，並以凍結的 Diff、Spec Version、Ticket、Acceptance Criterion 與 Verification Evidence 為輸入。Review 期間只能產生 Finding，不能修改程式碼；阻擋性 Finding 會令 Ticket 返回實作階段，修正後必須對新 Diff 重新 Review。規則優先序依次為核准 Spec 與 Acceptance Criterion、核准 Ticket 與 Test Plan、Repository 的 `AGENTS.md`／`CONTEXT.md`／ADR、Stack Profile、通用最佳實務；高層來源衝突時建立阻擋性 Finding，不能自行猜測。這降低自我認可風險，同時避免第一版引入第二模型或平行 Agent。
