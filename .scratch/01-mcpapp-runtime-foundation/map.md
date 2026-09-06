# 01 Runtime Foundation Ticket Map

Parent Spec: [01 — Runtime Foundation Spec](spec.md)

| Ticket                                                                                              | Status          | Blocked by | Requirement／AC            |
| --------------------------------------------------------------------------------------------------- | --------------- | ---------- | -------------------------- |
| [01 — 啟動並查詢 McpApp Server](issues/01-start-and-query-mcpapp-server.md)                         | resolved        | —          | Runtime entrypoint         |
| [02 — 建立並持久保存受管專案草稿](issues/02-create-and-persist-managed-project.md)                  | claimed         | 01         | REQ-001 foundation         |
| [03 — 為受管專案建立 Open Work Session](issues/03-begin-open-work-session.md)                       | ready-for-agent | 02         | AC-001 create              |
| [04 — 跨 HTTP 重連與本機 Host 恢復 Work Session](issues/04-resume-work-session-across-clients.md)   | ready-for-agent | 03         | AC-001 resume、AC-002      |
| [05 — Server 重啟後提供 Resume Context](issues/05-resume-context-after-server-restart.md)           | ready-for-agent | 04         | AC-003 normal restart      |
| [06 — 關閉 Work Session 並驗證變更 handle](issues/06-close-work-session-and-validate-handle.md)     | needs-triage    | 03         | AC-093                     |
| [07 — 阻止第二個 McpApp Server 實例](issues/07-prevent-second-server-instance.md)                   | ready-for-agent | 01         | AC-027 live owner          |
| [08 — 辨識並恢復 stale Server instance lock](issues/08-recover-stale-server-lock.md)                | ready-for-agent | 07         | AC-027 stale lock          |
| [09 — 競爭變更立即回傳 PROJECT_BUSY](issues/09-return-project-busy-for-competing-mutations.md)      | ready-for-agent | 06         | AC-028                     |
| [10 — 釋放 Mutation Guard 並重新驗證重試](issues/10-release-mutation-guard-and-revalidate-retry.md) | ready-for-agent | 09         | AC-029                     |
| [11 — 讓具副作用操作可冪等重試](issues/11-make-mutations-idempotent.md)                             | ready-for-agent | 10         | Idempotency contract       |
| [12 — 從中斷操作辨識並恢復部分結果](issues/12-recover-interrupted-operation.md)                     | ready-for-agent | 05、08、11 | AC-003 interrupted、AC-030 |

## Frontier

Ticket 01 已完成。Ticket 02 與 Ticket 07 已解除 blocker；目前依交付順序認領
Ticket 02，因此尚未被認領的 frontier 是 Ticket 07。McpApp Repository 仍依開發規範
一次實作一張 Ticket。

## Decision log

- Ticket 01 已由 [PR #1](https://github.com/krok1029/mcpapp/pull/1) 合併，merge
  commit 為 `01ce44b7e599fff0c695b22bf0a486cf7f17b484`；合併前 CI 與安全檢查均通過。
- Ticket 02 依 MVP 交付順序先於同時解除阻擋的 Ticket 07 認領；review fixed point
  為 `c5a46c7`。
- Ticket 02 review 確認建立受管專案草稿是先於 `project_id` 與 Work Session 的
  bootstrap 操作；此澄清保存為 Spec Version v002，並完成 Impact Analysis。
- Impact Analysis 判定 Ticket 03 不受影響；Ticket 06 直接受影響，已回到
  `needs-triage` 等待重新確認。
- Spec Version v003 使用 `AC-093` supersede `AC-004`，避免以相同 ID 表示實質不同的
  驗收語意；v001 與 v002 保持不可變。

## Dependency graph

```text
01 → 02 → 03 → 04 → 05 ─────────────┐
          └→ 06 → 09 → 10 → 11 ────┼→ 12
01 → 07 → 08 ───────────────────────┘
```
