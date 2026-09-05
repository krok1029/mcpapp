# McpApp MVP Spec Map

這份 Map 只負責 MVP 的 Spec 邊界、交付順序與依賴，不取代各 feature Spec。所有 Spec 都使用 `ready-for-agent`，拆票與實作必須以個別 Spec 為單位。

| 順序 | Milestone  | Spec                                                                               | Requirement      | Blocked by |
| ---- | ---------- | ---------------------------------------------------------------------------------- | ---------------- | ---------- |
| 01   | M0 Define  | [Runtime Foundation](../01-mcpapp-runtime-foundation/spec.md)                      | REQ-001、REQ-007 | —          |
| 02   | M0 Define  | [Host-neutral Project Console](../02-mcpapp-host-console/spec.md)                  | REQ-006、REQ-020 | 01         |
| 03   | M0 Define  | [Spec Definition Workflow](../03-mcpapp-define/spec.md)                            | REQ-002～REQ-005 | 01、02     |
| 04   | M1 Deliver | [Repository Provisioning](../04-mcpapp-provisioning/spec.md)                       | REQ-008          | 03         |
| 05   | M1 Deliver | [Backlog and Ticket Planning](../05-mcpapp-ticket-planning/spec.md)                | REQ-009          | 04         |
| 06   | M1 Deliver | [Controlled Implementation and Evidence](../06-mcpapp-controlled-delivery/spec.md) | REQ-010～REQ-012 | 05         |
| 07   | M1 Deliver | [Review, PR and Milestone Completion](../07-mcpapp-review-release/spec.md)         | REQ-013～REQ-015 | 06         |
| 08   | M2 Trace   | [Traceability and Impact Analysis](../08-mcpapp-traceability/spec.md)              | REQ-016～REQ-017 | 07         |
| 09   | M2 Trace   | [Local Records and Project Lifecycle](../09-mcpapp-record-lifecycle/spec.md)       | REQ-018～REQ-019 | 08         |

## Shared testing seams

1. MCP Tool contracts through Streamable HTTP, using a real temporary SQLite database.
2. Project Console flows through MCP Apps `basic-host`.
3. External side-effect adapters: real temporary Git repositories, a recording Fake GitHub adapter in normal CI, and explicitly enabled isolated GitHub E2E.

SQLite is part of the first integration seam. ORM internals are not a public seam. Domain unit tests may provide fast feedback but do not replace the highest observable seam.

## Delivery rule

先完成並驗收一份 Spec 所拆出的 tracer-bullet Tickets，再進入下一份被它阻擋的 Spec。不得把九份 Spec 重新合併成單一巨型 Ticket backlog。
