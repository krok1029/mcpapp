# Repository Pull Request Governance Spec

Status: ready-for-agent

## Problem Statement

Repository 尚未提供固定的 Pull Request 模板，新的 PR 容易遺漏 Ticket
追溯、驗證證據、Review Finding、發布範圍或專案擁有者核准資訊，且預設內容未統一使用中文。

## Solution

在 GitHub 標準路徑建立一份中文版 Pull Request 模板，讓新 PR 以一致結構記錄變更、
證據、Review 與發布核准資訊。

## Requirement and Acceptance Criteria

### REQ-001 — 提供固定中文版 Pull Request 模板

- AC-001：Repository 在 `.github/pull_request_template.md` 提供可由 GitHub
  自動套用的模板。
- AC-002：模板使用中文標題與說明，並保留必要的專案領域詞彙與技術名稱。
- AC-003：模板包含 Spec、Ticket、Requirement／Acceptance Criterion、Verification
  Evidence、Standards／Spec Review、Finding、風險、發布範圍與核准資訊。
- AC-004：模板以 Checklist 提醒作者確認 Ticket 範圍、敏感資料、品質指令、Review、
  GitHub Actions 與專案擁有者 Merge 邊界。

## Testing Decisions

- 此變更是文件與 GitHub 設定，不建立沒有失敗意義的自動化測試。
- Verification Evidence 使用 formatter 與 `git diff --check`。

## Out of Scope

- 不修改 Runtime Foundation Ticket 01 的程式碼或既有 Commit。
- 不把模板 Commit 加入 Runtime Foundation Ticket 01 的 PR。
