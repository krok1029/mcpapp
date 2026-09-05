# 以結構化產物作為工作流事實來源

Spec、Requirement 與 Ticket 的結構化版本保存在目前啟用的單一 Storage Backend，作為工作流事實來源；M0／MVP 依 ADR-0017 只使用內嵌 SQLite。產物核准後同步產生 Markdown 並寫入 Repository，作為可隨 Git 攜帶的人類可讀快照。程式碼與 Commit 以 Git 為準，知識圖譜則由上述來源投影且可重建。若 Markdown 被直接修改，McpApp 必須要求匯入為新草稿或還原快照，不得默默覆蓋任一版本。
