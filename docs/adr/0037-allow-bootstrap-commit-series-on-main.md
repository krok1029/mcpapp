# 允許一次直接建立 main 的 Bootstrap Commit Series

完全空白的 GitHub Repository 沒有可供 PR 合併的 base branch，因此 Repository 建立核准同時授權一次直接 Push 到 `main` 的 Bootstrap Commit Series。Series 必須依內容拆成少量、順序固定且可獨立理解的 Commit，只能包含 Repository Plan 核准的初始結構、Agent 與領域文件、Spec 快照、品質指令、CI、README 與必要設定，不屬於 Ticket 或 PR；之後所有功能變更都遵循一 Ticket、一 Branch、一 PR、多 Commit。
