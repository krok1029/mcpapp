# AI 原生開發管理

此領域描述由 AI Agent 執行、由人類掌握關鍵決策，並保留需求到程式碼變更之間可追溯關係的軟體開發流程。

## Language

### 需求與驗證

**Spec**：
描述受管專案的願景、目標使用者、問題、目標、非目標、使用情境、需求、限制、假設與成功條件的核准產物。
_Avoid_：PRD、需求文件

**Spec Readiness Checklist**：
用來判斷訪談是否已解決所有阻擋性缺口、可以進入 Spec Review 的明確條件集合。
_Avoid_：完成百分比、固定問卷

**Requirement**：
Spec 中一項可獨立追蹤的必要能力或限制，具有跨版本保持可辨識的身分。
_Avoid_：功能點、待辦事項

**Acceptance Criterion**：
用來判斷某項 Requirement 是否成立的可觀察條件。
_Avoid_：Test Case、完成定義

**Spec Version**：
Spec 在特定時間點的不可變內容；核准後的版本會永久保留，後續變更必須產生新版本。
_Avoid_：最新版 Spec、覆寫後的 Spec

**Draft Revision**：
尚未核准產物的一次遞增修訂，用來偵測 Host Agent 與專案擁有者同時編輯造成的衝突。
_Avoid_：Spec Version、最後寫入結果

**Impact Analysis**：
Spec Version 改變時，辨識哪些 Requirement、Ticket、Test 與未提交程式變更可能需要重新確認的結果。
_Avoid_：全 Repository 重掃、重新執行全部工作

**Ticket**：
可由 Host Agent 在一次連續工作階段中完成，並能獨立 Review、驗證與交付的垂直變更；它必須連回相關 Requirement 與 Acceptance Criterion，且對應的 PR 合併後才算完成。
_Avoid_：Task、工作項目、水平分工

**Active Ticket**：
受管專案中目前唯一獲准進入實作與 PR 流程的 Ticket；其他 Ticket 在它完成或關閉並處置前只能等待。
_Avoid_：平行 Ticket、進行中的 Backlog Item

**Backlog Map**：
依據核准 Spec 建立的粗粒度工作全貌，描述候選工作、順序與依賴；其中的項目在即將開始前才會細化為 Ticket。
_Avoid_：完整 Ticket 清單、固定開發計畫

**Ticket Candidate**：
從 Backlog Map 選出、準備依最新專案狀態細化為 Ticket 的下一項工作；由 Host Agent 推薦並由專案擁有者選擇。
_Avoid_：Active Ticket、自動指派工作

**Milestone**：
受管專案中具有明確 Requirement 與可驗證完成條件的一個交付目標；受管專案可以持續演進，但每個 Milestone 可以被明確完成。
_Avoid_：專案永久完成、任意截止日期

**Pull Request（PR）**：
將一張 Ticket 的一個或多個 Commit 提交至 GitHub 審查的交付單位；一張 Ticket 恰好對應一個 PR，由專案擁有者負責 Merge。
_Avoid_：單一 Commit、跨 Ticket PR

**Bootstrap Commit Series**：
依照核准的 Repository Plan，以少量、順序固定且可獨立理解的直接提交建立受管 Repository 初始狀態；整個 Series 不屬於 Ticket 或 PR。
_Avoid_：功能 Commit、未核准或任意拆分的初始提交

**PR Label**：
從受控詞彙中選取、用來表示 PR 類型與風險的 GitHub Label；由 Host Agent 建議並經專案擁有者核准。
_Avoid_：Git Tag、臨時標籤

**驗證證據（Verification Evidence）**：
證明 Ticket 或 Acceptance Criterion 已符合預期的可檢查結果；自動化證據必須由受控工具或 GitHub Checks 實際產生，人工或視覺證據則必須由專案擁有者明確確認。
_Avoid_：Host Agent 自述、完成宣告

**受控工具（Controlled Tool）**：
由 McpApp 提供並記錄輸入、執行脈絡與結果的操作能力，用來產生可驗證的執行證據。
_Avoid_：未記錄指令、Host Agent 自述

**受控 Repository 操作（Controlled Repository Operation）**：
由 McpApp Server 在受管 Repository 內執行的窄介面操作，包含讀取、搜尋、套用 Patch、檢視狀態與 Diff；操作必須受 Active Ticket、允許路徑、基準內容與核准政策約束，且留下可追溯結果。
_Avoid_：任意 Shell、無限制檔案系統工具、Host 直接寫入

**高風險操作（High-risk Operation）**：
可能刪除、移動、覆寫資料，改變依賴或產生難以復原狀態的操作，必須取得專案擁有者的即時確認。
_Avoid_：一般寫入、已核准的 Ticket 修改

**Out-of-band Change**：
未經 McpApp 受控流程產生，且尚未對應目前 Ticket 與 Evidence 的 Repository 變更。
_Avoid_：已核准變更、受控工具輸出

**Manual Change**：
由專案擁有者在 McpApp 工作流之外完成並主動納入紀錄的修改或 Commit；系統如實保存其來源與缺少的驗證，不補造 Ticket 或 PR。
_Avoid_：Agent Ticket、虛構 PR、未分類變更

**Review Run**：
針對一份凍結 Diff 與其開發證據鏈執行的獨立審查過程；期間只能產生 Finding，不能修改待審程式碼。
_Avoid_：實作階段的自我檢查、邊改邊審

**Finding**：
Review Run 對 Spec、Ticket、驗證證據或 Diff 提出的具體問題，包含 P0 至 P3 嚴重度、檔案位置、證據、影響、建議與處置結果。
_Avoid_：一般建議、未附證據的意見

### 角色與專案

**專案擁有者（Project Owner）**：
對 Repository、需求核准與高風險操作擁有最終決定權的人。MVP 中，專案擁有者同時也是唯一的開發者。
_Avoid_：使用者、管理員

**專案範本（Project Template）**：
建立新 Repository 時採用的預先定義且可重現的起始結構；新的專案類型應透過增加範本擴充，而不是臨時改造既有範本。
_Avoid_：Starter、腳手架

**開發棧設定檔（Stack Profile）**：
描述某種語言或框架如何建立專案、管理依賴、執行品質檢查及分析程式碼的能力集合。
_Avoid_：專案範本、硬編碼框架

**受管專案（Managed Project）**：
由 McpApp 建立並管理開發流程的 side project。它可在尚無 Repository 時先存在；完成 Repository 建立核准後，會擁有一個獨立的本機 Git Repository 與對應的 GitHub Repository。
_Avoid_：McpApp Repository、Workspace

**Archived Project**：
已停止 Agent 工作但仍保留 Repository、開發證據鏈、查詢與匯出能力的受管專案。
_Avoid_：已刪除專案、已完成 Milestone

**Repository Plan**：
在建立本機與 GitHub Repository 前，由專案擁有者核准的結構化建立契約，描述目的路徑、開發棧、初始結構、品質檢查與預期產物。
_Avoid_：腳手架指令、未核准的建立方案

**Documentation Language**：
受管專案中 Spec、Ticket、ADR、Review、PR 與 Commit 摘要採用的主要自然語言；程式碼識別字、固定 ID、指令、路徑與技術專有名詞不受此設定改寫。
_Avoid_：程式語言、介面語系

**Provisioning Run**：
依照核准的 Repository Plan 建立本機與 GitHub Repository 的一次可重試執行，會分別記錄每個步驟的結果。
_Avoid_：不可恢復的建立指令、自動清理

**Host Agent**：
由相容 MCP Host 提供、負責需求分析、規劃、程式修改與 Review 的 AI 協作者。MVP 以 Codex 驗證完整執行流程；ChatGPT Pro 驗證目前可用的對話、UI 與 read/fetch 相容性。
_Avoid_：Codex Agent、內嵌 Agent、McpApp Agent

**MCP App Host**：
載入 MCP Tools、呈現 `ui://` 資源並透過標準 MCP Apps bridge 與 UI 溝通的客戶端。McpApp 以能力偵測適應 Host，不依產品名稱分支。
_Avoid_：瀏覽器、McpApp Server、固定 ChatGPT API

**Project Console**：
由 MCP App Host 呈現的受管專案介面，用來查看工作流、編輯產物、檢視 Diff、回應 Approval Challenge 與查看 Evidence；M0 在 Local Owner Trust 下允許它直接記錄本機核准。
_Avoid_：獨立管理後台、遠端 Owner Console

**Host 驗證路徑（Host Verification Path）**：
針對不同 Host 能力驗證同一套 McpApp contracts 的互補測試路徑；MVP 分別以 Codex 驗證 Agent 執行、`basic-host` 驗證完整 UI 與 write tools、ChatGPT Pro 驗證對話、UI 與 read/fetch 相容性。
_Avoid_：單一 Host 完整驗收、產品分支

**McpApp**：
協調開發流程、取得人工核准、執行受控 Repository 操作並保存可追溯紀錄的控制系統；它本身不是進行推理與規劃的 AI Agent。
_Avoid_：Agent Runtime、AI Agent

**McpApp Server**：
McpApp 對所有 MCP App Host 提供共同工具、資源與工作流狀態的唯一權威執行邊界；本機 Host 與經明確啟用之 Secure MCP Tunnel 連入同一個 Server 實例。
_Avoid_：Host 專屬 Backend、多份工作流 Server

**Work Session**：
由 McpApp Server 建立、讓 Host Agent 跨工具呼叫、重新連線與 Server 重啟延續工作的持久協作脈絡；每個受管專案同時只有一個 Open Work Session，Codex 與 Project Console 共同恢復它。
_Avoid_：聊天、HTTP 連線、MCP transport session、存取憑證

**Local Owner Trust**：
M0 將目前登入作業系統、持有本機安裝 Token 的單一使用者與其允許的 loopback Client 視為同一專案擁有者信任域；它不宣稱能以密碼學方式區分人類點擊與 Agent 呼叫，也不能延伸至遠端連線。
_Avoid_：多人授權、遠端信任、可驗證人類身分

**Mutation Guard**：
M0 中讓一個受管專案同時只能執行一項變更操作的 single-flight 保護；競爭請求不排隊，而是在重新讀取最新狀態後重試。
_Avoid_：Workflow Lease、寫入佇列、平行變更

**開發證據鏈（Development Evidence Chain）**：
由原始想法、版本化產物、核准、工具結果、測試、程式變更、Review 與 Commit 組成的可驗證關聯紀錄。
_Avoid_：完整聊天紀錄、思考過程、活動日誌

**Project Record Bundle**：
受管專案的版本化可攜匯出物，包含結構化產物、核准、Evidence 摘要與知識圖譜關係。
_Avoid_：資料庫備份、Git Repository

**Resume Context**：
讓 Host Agent 在對話或應用程式中斷後繼續工作的結構化摘要，包含目前狀態、Active Ticket、最近證據、待處理閘門與 Repository 差異。
_Avoid_：聊天逐字稿、使用者重新敘述

**核准產物（Approved Artifact）**：
經專案擁有者核准、不可原地覆寫的結構化版本；其人類可讀快照會同步寫入 Repository。
_Avoid_：最終檔案、最新版文件

**知識圖譜（Knowledge Graph）**：
由工作流事實、Repository 與 Git 資料投影而成的關係索引，可重新建立且不具事實來源地位。
_Avoid_：主資料庫、事實來源

**推論關係（Inferred Relationship）**：
由 Host Agent 根據內容提出、並附有證據、信心水位與審核狀態的圖譜關係；未經確認時不能單獨驅動阻擋性工作流決策。
_Avoid_：已確認事實、無證據關係

**相關子圖（Relevant Subgraph）**：
以當前 Requirement、Ticket、PR 或 File 為中心，只呈現回答當前問題所需關係的知識圖譜視圖。
_Avoid_：完整圖譜、全域關係圖

**核准閘門（Approval Gate）**：
工作流中必須取得專案擁有者明確同意才能跨越的決策點；MVP 包含 Spec、Repository 建立、Ticket、Commit、變更與 PR 發布六種核准閘門，其中 Commit 閘門可在一張 Ticket 中重複發生。
_Avoid_：檢查點、確認視窗

**Approval Challenge**：
等待專案擁有者確認的短效核准請求，精確綁定操作、內容版本、Work Session 與受管專案；任何綁定內容改變都使它失效。
_Avoid_：通用確認、未綁定提示、可重放請求

**Approval Proof**：
McpApp Server 在 Project Console 接受 Approval Challenge 後保存的單次核准事實；M0 只把它視為 Local Owner Trust 下的本機 UI 核准紀錄，不宣稱具有人類身分的密碼學證明。
_Avoid_：Approval Token、Agent 自述、遠端身分證明
