Status: ready-for-agent
執行順序: 01

# 01 — Runtime Foundation Spec

## Problem Statement

Host 對話、HTTP 連線與前景程序都可能中斷。如果 McpApp 把工作狀態綁在其中任何一項，專案擁有者就必須重新敘述上下文，也無法知道中斷中的副作用是否留下部分結果。同時，Codex 與 Project Console 可能對同一受管專案發出競爭寫入。

## Solution

建立單一本機、手動啟動的 Streamable HTTP McpApp Server，以 SQLite 作為 M0／MVP 唯一 Storage Backend。Server 保存獨立於 transport 的 Work Session 與 Resume Context，並以每受管專案 single-flight Mutation Guard 保護變更操作。

### Requirements and Acceptance Criteria

#### REQ-001 — 建立與恢復受管專案

- AC-001：`begin_or_resume_work` 在沒有 Open Work Session 時建立新的不透明 handle；已有時回傳同一 handle 與最新 Resume Context。
- AC-002：Host 對話結束、HTTP 中斷及 Project Console 重載不會關閉 Work Session。
- AC-003：Server 重啟後可恢復受管專案、目前狀態、最後成功步驟、待處理閘門與 Evidence metadata。
- AC-004：純讀取不需要 Work Session；所有變更型工具都要求有效 handle。

#### REQ-007 — 單一 Server 與並行保護

- AC-027：第二個 Server 實例被單一實例鎖拒絕，或能安全辨識並處置 stale lock。
- AC-028：同一受管專案已有變更操作時，競爭請求立即收到 `PROJECT_BUSY` 與目前操作摘要，不進入佇列。
- AC-029：Mutation Guard 在成功或失敗後釋放；重試前必須重新讀取 Draft Revision、Git HEAD 與工作樹指紋。
- AC-030：異常終止後依持久操作紀錄、工作流狀態與 Repository 指紋辨識部分結果，不假裝操作未發生。

## User Stories

1. As a 專案擁有者, I want to 以單一開發指令啟動 McpApp, so that M0 不需要安裝背景服務。
2. As a Host Agent, I want to 取得明確的 Work Session handle, so that 工作不會依賴 HTTP session。
3. As a Host Agent, I want to 在重新連線後恢復同一 Work Session, so that 不必請使用者重述狀態。
4. As a 專案擁有者, I want to 在 Server 重啟後保留所有已保存工作, so that 前景程序停止不會毀損專案。
5. As a Host Agent, I want to 從 Resume Context 得知目前步驟與待處理閘門, so that 我能安全續作。
6. As a Project Console user, I want to 和 Codex 看見相同權威狀態, so that 兩個 Host 不會形成分叉流程。
7. As a Host Agent, I want to 在競爭寫入時收到 `PROJECT_BUSY`, so that 我能重新讀取狀態後重試。
8. As a 專案擁有者, I want to 讓失敗操作立即釋放 Mutation Guard, so that 專案不會永久卡住。
9. As a 專案擁有者, I want to 知道異常中止是否留下部分結果, so that 重試不會重複副作用。
10. As a 專案擁有者, I want to 阻止第二個 Server 實例寫入同一資料, so that SQLite 與工作流狀態保持一致。

## Implementation Decisions

- McpApp Server 是唯一權威執行程序，以 Streamable HTTP 提供工具與資源。
- M0 由專案擁有者手動以前景程序啟動，不建立 service、自啟、tray、安裝器或自動更新。
- M0／MVP 只使用 Drizzle ORM 與 SQLite；Domain 與 Application 不直接依賴 ORM。
- Work Session handle 是狀態關聯，不是 bearer credential，也不等同 transport session ID。
- 每個受管專案同時只允許一個 Open Work Session，只有明確結束或放棄才會關閉。
- 具副作用工具使用 Idempotency Key；中斷後先查證持久狀態與外部結果再重試。
- Mutation Guard 不排隊、不 heartbeat、不使用 Workflow Lease；競爭呼叫者自行重新讀取後重試。
- 執行中的狀態轉移、核准與 Evidence metadata 必須交易式持久化。

## Testing Decisions

- 主要 seam 是透過 Streamable HTTP 呼叫真實 Server，並使用真實暫存 SQLite 觀察狀態。
- 測試建立、恢復、明確關閉 Work Session，以及跨 HTTP 重連與 Server 重啟的結果。
- 以可控的長時間變更操作測試 `PROJECT_BUSY`、不排隊、釋放與重試語意。
- 以中斷點測試 Idempotency Key、stale lock 與部分結果復原；只驗證外部狀態，不測鎖或 ORM 實作細節。
- Domain 單元測試只作快速回饋，不能取代 Server contract integration tests。

## Out of Scope

- 背景 service、自動啟動、tray、桌面安裝器與自動更新。
- 多個 Open Work Session、平行 Active Ticket、Workflow Lease 或寫入佇列。
- PostgreSQL、Supabase、雙寫與遠端 Server replica。
- 遠端 Client 與多人協作。

## Further Notes

- 本 Spec 是所有其他 MVP Specs 的基礎。
- 執行資料位置、安全 Token 與 Project Console visibility 分別由後續 Specs 完成，但不得建立第二個權威 Server。
