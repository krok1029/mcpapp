Status: ready-for-agent
執行順序: 02

# 02 — Host-neutral Project Console Spec

## Problem Statement

McpApp 必須同時支援無 UI 的 Host Agent 與可呈現 MCP App 的 Host。若核心流程依賴 Codex 專屬能力、Host 名稱或某套本機 skills，其他 Host 無法沿用；若核准工具直接暴露給模型，Agent 又可能在正常工具選擇中意外自我核准。

## Solution

以標準 MCP Apps UI Resource 與 bridge 建立單一狀態驅動的 Project Console。一般領域工具保持 Agent-visible，核准與純 UI 互動使用 app-only visibility，兩者呼叫相同 application commands。M0 採明確受限的 Local Owner Trust，只接受 loopback Client 與 owner-only 本機 Token。

### Requirements and Acceptance Criteria

#### REQ-006 — M0 Local Owner Trust

- AC-022：Server 僅監聽 loopback、嚴格驗證 Origin，並要求本機安裝 Token。
- AC-023：Token 隨機產生並保存於只有目前作業系統使用者可讀的應用資料檔案，不進入 Repository、Evidence 或日誌。
- AC-024：Project Console 以 app-only 工具回應 Approval Challenge；該工具不出現在 model-visible 清單，也沒有 Agent-visible 核准替代工具。
- AC-025：產品明確不宣稱 M0 能以密碼學方式區分人類點擊與 Agent 呼叫。
- AC-026：M0 不接受遠端連線，也不實作 OAuth、每 Client Grant、Owner Session、原生 credential broker 或獨立 Owner Console。

#### REQ-020 — Host-neutral MCP App

- AC-088：Project Console 使用標準 MCP Apps UI Resource 與 bridge；Host 專屬能力先 capability detection，再採標準退化路徑。
- AC-089：一般領域能力在無 UI Host 仍可使用；UI 表單與核准 adapter 呼叫相同 application commands。
- AC-090：產品只驗證產物、狀態轉移、核准與 Evidence，不依賴 Host 是否安裝特定 skills。
- AC-091：M0 以 Codex 驗證無 UI Agent 流程，以 `basic-host` 驗證 Project Console、write tools 與 app-only visibility。
- AC-092：Secure MCP Tunnel 與 ChatGPT Pro 遠端路徑不在 M0 啟用；啟用前必須重新決定遠端授權模型。

## User Stories

1. As a 專案擁有者, I want to 在 Project Console 查看工作流狀態, so that 我不必從聊天推測目前進度。
2. As a Project Console user, I want to 在同一介面依狀態切換內容, so that 不需要維護多套分離網站。
3. As a Codex Host Agent, I want to 使用無 UI 的一般領域工具, so that 完整 Agent 流程不依賴視覺介面。
4. As a different MCP App Host, I want to 使用相同 contracts, so that McpApp 不會依 Host 名稱分支。
5. As a Project Console user, I want to 在 Host 缺少選用能力時得到清楚退化行為, so that 核心流程仍可理解。
6. As a 專案擁有者, I want to 讓核准工具對模型不可見, so that Agent 不會在正常工具選擇中自我核准。
7. As a 專案擁有者, I want to 使用一把只留在本機的安裝 Token, so that M0 不必建立複雜身分系統。
8. As a 專案擁有者, I want to 知道 Local Owner Trust 的限制, so that 我不會把它誤認為遠端人類身分證明。
9. As a Host Agent, I want to 在 Approval Gate 等待 Project Console 回應, so that 核准仍由專案擁有者操作。
10. As a Host Agent, I want to 有 skills 時使用 playbook、沒有時遵循同一契約, so that 產品不綁定 Codex 安裝環境。
11. As a 專案擁有者, I want to 在 `basic-host` 驗證完整 write surface, so that Host 限制不會掩蓋 Server 能力。
12. As a 專案擁有者, I want to 延後遠端連線, so that 第一階段不承擔未解決的遠端認證風險。

## Implementation Decisions

- 使用單一 React 與 Vite UI bundle，畫面由結構化工作流狀態驅動。
- Server 以標準 UI Resource metadata 將適用工具連到 Project Console。
- 一般領域工具 Agent-visible；核准、表單提交、分頁與重新整理等純 UI 工具標示 app-only。
- UI adapter 與 Agent-visible adapter 共用 application commands，不複製領域規則。
- Host 專屬能力以 capability detection 處理，不以產品名稱建立業務分支。
- M0 Token 在第一次啟動產生，只存 owner-readable 本機檔案，所有記錄先排除 Token。
- Approval Challenge 綁定內容且不可重放，但 M0 不將 UI 點擊描述為可驗證人類身分。
- Skills 只作參考 playbook；強制規則必須存在於 schema、狀態機、核准或 Evidence contracts。

## Testing Decisions

- 主要 seam 是透過 `basic-host` 載入真實 UI Resource，觀察 Project Console 與 Server 的完整互動。
- 驗證 app-only 工具未出現在 model-visible 工具清單，且沒有可替代的 Agent-visible 核准工具。
- 從無 UI Client 驗證一般領域工具仍可完成其流程，UI adapter 與 Agent adapter 產生相同領域結果。
- 驗證 loopback binding、Origin rejection、缺少或錯誤 Token、Token redaction 及權限不足的 Token 檔案。
- capability detection 只測可觀察退化結果，不測 Host 名稱或 UI component internals。

## Out of Scope

- 遠端 Client、Secure MCP Tunnel 與 ChatGPT Pro 遠端驗證。
- OAuth、每 Client Grant、Owner Session、獨立 Owner Console 與 native credential broker。
- 可證明是人類操作的密碼學身分邊界。
- 獨立 Next.js 網站、Host 專屬業務流程與強制 skill 安裝。

## Further Notes

- 本 Spec 依賴 Runtime Foundation。
- 遠端存取前必須重新評估保留中的授權 ADR，不能直接沿用 M0 Local Owner Trust。
