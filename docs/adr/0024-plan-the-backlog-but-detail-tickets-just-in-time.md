# 建立 Backlog Map 並即時細化 Ticket

Spec 核准後先產生粗粒度 Backlog Map，讓專案擁有者檢視專案範圍、依賴與大致順序；只有下一個 Ticket Candidate 會依最新 Spec、Repository 與已合併 PR 展開為可核准的完整 Ticket。Host Agent 依「依賴已解除、最快驗證價值、優先降低風險、範圍較小、避免水平分工」推薦候選項目，但最終由專案擁有者選擇；未解除的依賴會阻止啟動。Backlog Map 可持續編輯且不設獨立核准閘門，只有完整 Ticket 的核准能授權實作。這避免過早建立容易過期的詳細 Ticket，同時保留整體規劃與 Impact Analysis 能力。
