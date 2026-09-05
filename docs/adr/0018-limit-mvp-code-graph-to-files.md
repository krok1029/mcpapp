# 將 MVP 程式碼圖譜限制在 File 層級

MVP 完整建立 Idea、Spec Version、Requirement、Acceptance Criterion、Ticket、Verification Evidence、Commit 與 PR 的流程圖譜，但程式碼圖譜只包含 Repository、Module 與 File。Ticket、Commit、Evidence 與 PR 會連回相關流程及 File 節點；Class、Function、API、Database 與 External Service 等細粒度節點延後，以避免第一版承擔重新命名、移動與符號身分追蹤的複雜度。
