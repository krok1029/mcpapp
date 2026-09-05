# 01 — 建立中文版 Pull Request 模板

**What to build:** 在 GitHub 標準路徑建立固定中文版 Pull Request 模板，使每張新 PR
一致記錄需求追溯、驗證證據、Review、風險與發布核准資訊。

**Blocked by:** None — can start immediately

**Status:** claimed

- [x] `.github/pull_request_template.md` 存在且可由 GitHub 自動套用。
- [x] 模板使用中文並涵蓋 Spec 定義的所有必要段落。
- [x] Runtime Foundation Ticket 01 的 PR 不包含此模板 Commit。
- [x] Formatter 與 `git diff --check` 通過。

## Verification Evidence

- 此變更只包含文件與 GitHub 設定，依 Spec 不建立自動化測試。
- `yarn format:check` 通過，129 個檔案格式正確。
- `git diff --check` 通過。
