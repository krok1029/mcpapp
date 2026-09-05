Status: approved

# McpApp Repository Bootstrap Plan

## 核准範圍

本計畫只建立 McpApp 自身可開始 Ticket 開發的 Git 基線、模組化單體骨架與可執行品質工具鏈。它不實作任何 Ticket 的產品行為，不建立 runtime status MCP Tool，也不建立 SQLite schema。

核准本計畫後，Bootstrap Run 才能初始化本機 Git Repository、安裝核准的初始依賴、執行品質檢查，並建立一次直接位於 `main`、依內容分成三筆 Commit 的 Bootstrap Commit Series。任何實際輸出若偏離本計畫，必須停止並重新取得核准。

## Repository 身分

| 欄位                   | 計畫值                                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| 名稱                   | McpApp                                                                                                          |
| 用途                   | 協調 AI 原生軟體開發流程、取得專案擁有者核准、執行受控 Repository 操作並保存可驗證的 Development Evidence Chain |
| 本機目的路徑           | `/Users/limingfeng/Project/McpApp`                                                                              |
| GitHub owner           | `krok1029`                                                                                                      |
| GitHub repository 名稱 | `mcpapp`                                                                                                        |
| GitHub URL             | `https://github.com/krok1029/mcpapp`                                                                            |
| GitHub visibility      | Public                                                                                                          |
| 預設分支               | `main`                                                                                                          |
| Documentation Language | 繁體中文；程式碼識別字、固定 ID、指令、路徑與技術專有名詞維持英文                                               |
| License                | Apache-2.0                                                                                                      |

## 產品與交付邊界

- 產品型態：單人開發、local-first 的 MVP。
- 架構：TypeScript 模組化單體；單一 McpApp Server 是唯一權威執行邊界，不拆微服務。
- M0 執行模式：由專案擁有者以單一指令手動啟動 loopback Streamable HTTP 前景程序。
- M0／MVP Storage：SQLite；透過 Storage Adapter 隔離 Drizzle，Domain 與 Application 不直接依賴 ORM。
- Host 邊界：使用標準 MCP 與 MCP Apps contracts，不依 Host 名稱建立產品分支。
- 執行資料：開發期間只寫入 gitignored 的 `.data/`；不把 SQLite、Token、Evidence 原始輸出或匯出檔案納入 Git。
- 第一張可實作工作維持為 `01 — 啟動並查詢 McpApp Server`；Bootstrap 不偷渡該 Ticket 的實作。

## 開發棧

| 類別       | 選擇                         | 約束                                                                                                           |
| ---------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Runtime    | NVM 管理的 Node.js 24 LTS    | `engines.node` 使用 `>=24 <25`，以 `.nvmrc` 固定實際版本；不使用 Homebrew Node 或目前預設的 EOL Node 20        |
| 語言       | TypeScript，ESM              | 啟用 strict mode；應用與 package 使用 project references 或等價的明確邊界                                      |
| 套件管理   | Yarn 4 stable                | 透過 Corepack 與根目錄 `packageManager` 欄位鎖定 Bootstrap 當日實際版本；提交 `yarn.lock`                      |
| Workspace  | Yarn Workspaces              | 使用 `apps/*` 與 `packages/*`；採 `node-modules` linker 以降低 Node/MCP/SQLite 工具相容風險                    |
| 任務編排   | Turborepo 2 stable           | 只編排 `typecheck`、`lint`、`test`、`build`、`dev`，不承載業務邏輯                                             |
| MCP        | MCP TypeScript SDK v2 stable | Ticket 01 使用標準 Streamable HTTP server/client public seam；不使用已淘汰的 HTTP+SSE transport                |
| Schema     | Zod 4                        | runtime status 與 MCP Tool contracts 的 runtime validation；contract 定義放在 `packages/contracts`             |
| UI         | React 19 + TypeScript        | Bootstrap 只建立 Project Console shell，不提前實作受阻擋的工作流畫面                                           |
| UI Build   | Vite 8                       | 使用 Vite 8 內建 Rolldown bundler 與 Oxc transform/minify；不直接安裝 Rolldown、Oxc、esbuild 或 Rollup         |
| React 整合 | `@vitejs/plugin-react` 6     | 使用正式 plugin 的 Oxc Fast Refresh；不使用已 deprecated 的 `@vitejs/plugin-react-oxc`                         |
| 測試       | Vitest 5                     | Server 測試使用 Node environment；UI 元件測試使用 jsdom 與 Testing Library；真實瀏覽器 E2E 使用 Playwright     |
| API Mock   | MSW 2                        | 只作測試邊界，不模擬 McpApp Domain 或 private implementation                                                   |
| Lint       | Oxlint                       | 啟用 correctness、suspicious、perf 與 React／TypeScript／Vitest plugins；TypeScript 7 前不啟用 type-aware 模式 |
| Format     | Oxfmt                        | 使用 Prettier-compatible workflow；以 `.oxfmtrc.json` 固定格式，`format:check` 為必要檢查                      |
| Build      | TypeScript compiler + Vite 8 | Server packages 使用 `tsc` 產生 ESM；Project Console 使用 `tsc -b && vite build`                               |

所有第三方依賴在 Bootstrap Run 以核准 major 的最新 stable 精確解析，實際完整版本由 `package.json` 與 `yarn.lock` 固定。不得使用 alpha、beta、RC、canary、Git branch 或未鎖定的浮動版本。若 MCP SDK v2 或其他核准依賴在執行時沒有相容的 stable 版本，停止 Bootstrap Run，不自行降級或改採 prerelease。

## 初始 Workspace 輪廓

```text
McpApp/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .scratch/                         # 規劃工作區；保留現有 Spec、Map 與 Tickets
├── apps/
│   ├── mcp-server/                   # Ticket 01 的第一個產品 entrypoint
│   └── mcp-ui/                       # React + Vite 8 工具鏈與 Project Console shell
├── packages/
│   └── contracts/                    # Host-neutral schema 與 transport DTO
├── docs/
│   ├── adr/                          # 保留既有 ADR
│   └── agents/                       # 保留既有工作流程規則
├── .data/                            # runtime data；目錄不提交，只提交 ignore 規則
├── .gitignore
├── .nvmrc
├── .oxfmtrc.json
├── .oxlintrc.json
├── .yarnrc.yml
├── AGENTS.md                         # 保留既有內容
├── CONTEXT.md                        # 保留既有領域語言
├── package.json
├── README.md
├── tsconfig.base.json
├── turbo.json
└── yarn.lock
```

建立 Ticket 01 立即需要的 `mcp-server` 與 `contracts` workspace，並依專案擁有者要求加入可獨立建置及測試的 `mcp-ui` React／Vite 8 shell，以驗證完整前端工具鏈。Bootstrap 不實作 Project Console 工作流、MCP Apps bridge 或領域行為。`domain`、`application`、`storage`、`github`、`stack-typescript`、`graph` 等模組，等第一張需要它們的 Ticket 再以垂直切片加入。

## 初始依賴

### Runtime dependencies

- `@modelcontextprotocol/server`
- `@modelcontextprotocol/client`：供公開 Streamable HTTP contract 測試使用；若只由測試引用，安裝為 dev dependency。
- `@modelcontextprotocol/node`：Node.js Streamable HTTP adapter。
- `hono`：`@modelcontextprotocol/node` 的 Node HTTP adapter peer dependency；不建立額外 Server 邊界。
- `react`
- `react-dom`
- `zod`

### Development dependencies

- `typescript`
- `tsx`
- `turbo`
- `vitest`
- `vite`
- `@vitejs/plugin-react`
- `oxfmt`
- `oxlint`
- `@types/node`
- `@types/react`
- `@types/react-dom`
- `@testing-library/dom`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `jsdom`
- `msw`
- `@playwright/test`
- `@vitest/coverage-v8`

Drizzle、SQLite driver、`@modelcontextprotocol/ext-apps`、React Router、TanStack Query、Zustand、React Hook Form、Tailwind CSS 與 shadcn/ui 不在 Bootstrap 安裝；分別由第一張具備實際 Storage、MCP App UI、路由、資料、表單或設計需求的 Ticket 經核准後加入。Vite 8 已內建 Rolldown 與 Oxc，不直接安裝 `rolldown`、`oxc`、`esbuild`、`rollup` 或 `@vitejs/plugin-react-oxc`。

## 指令契約

根目錄必須提供以下非空 scripts，並由 Turborepo 呼叫各 workspace 的實際工作：

| 指令                 | 可觀察結果                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `yarn dev`           | 以前景模式啟動開發中的 McpApp Server；此行為由 Ticket 01 完成，Bootstrap 階段允許明確回報尚未實作，但不得假裝成功 |
| `yarn dev:ui`        | 以前景模式啟動 Vite Project Console shell，提供 HMR                                                               |
| `yarn typecheck`     | 對所有已存在 workspace 執行 TypeScript 靜態型別檢查                                                               |
| `yarn lint`          | 對所有已存在 source、test 與 config 檔執行 Oxlint                                                                 |
| `yarn test`          | 以 Vitest 執行所有已存在測試；Bootstrap 至少包含會失敗於錯誤設定的工具鏈 smoke test，而非 `passWithNoTests`       |
| `yarn test:coverage` | 以 V8 coverage provider 產生本機 coverage report；report 不納入 Git                                               |
| `yarn build`         | 建置所有可建置 workspace 並產生可執行 ESM 產物                                                                    |
| `yarn test:e2e`      | 以 Playwright Chromium 驗證 Vite preview 的真實瀏覽器路徑                                                         |
| `yarn format:check`  | 以 Oxfmt 檢查受版本控制的文字檔格式                                                                               |

Ticket 01 完成時，四個固定品質指令必須涵蓋實際 Server 與 Streamable HTTP contract test，不得只驗證空骨架。

## CI

`.github/workflows/ci.yml` 在 Pull Request 與 `main` push 上執行：

1. Checkout。
2. 安裝 Node.js 24。
3. 啟用 Corepack，使用 `packageManager` 固定的 Yarn 版本。
4. `yarn install --immutable`。
5. 依序執行 `yarn typecheck`、`yarn lint`、`yarn format:check`、`yarn test`、`yarn build`。
6. 安裝 Playwright Chromium，執行 `yarn test:e2e`。

CI 不建立或刪除 GitHub Repository，不連線真實 GitHub Adapter，不讀取 `.data/`，也不要求產品 Token。

## Bootstrap Run

核准後依序執行，任一步失敗即停止並保存可檢查輸出：

1. 確認目的路徑正是 `/Users/limingfeng/Project/McpApp`，且現有文件與 `.scratch/` 內容未被覆寫。
2. 透過 NVM 安裝並切換到 `.nvmrc` 指定的 Node.js 24 LTS；確認 `nvm current` 與 `node --version` 符合計畫。
3. 啟用 Corepack，選定 Yarn 4 stable 的明確版本，寫入 `packageManager`。
4. 建立核准的檔案與 workspace，不新增 Ticket 01 的產品行為。
5. 安裝初始依賴並產生 lockfile。
6. 執行 `yarn install --immutable`、Typecheck、Lint、Test、Build、Playwright E2E 與 format check，保存 Verification Evidence。
7. 顯示完整待提交 Diff、實際解析的版本、品質輸出、Commit 分批與風險偏差，取得 Bootstrap Commit Series 核准。
8. 初始化 Git，建立 `main`，依序產生三筆 Bootstrap Commit：產品領域與架構、交付流程與實作路線圖、可執行 TypeScript monorepo 基線。
9. 確認 `https://github.com/krok1029/mcpapp` 是核准的 Public GitHub Repository，設定 `origin` 並 push `main`；若 GitHub 登入或 CLI 尚未就緒，停止在本機 Bootstrap Commit Series，不宣稱遠端完成。
10. 驗證乾淨工作樹、`main`、remote URL、Bootstrap Commit Series 內容及 GitHub Actions 結果。

Bootstrap Commit 訊息依序為：

1. `docs: establish product domain and architecture`
2. `docs: add delivery workflow and implementation roadmap`
3. `chore: bootstrap TypeScript monorepo`

## Bootstrap 驗收證據

- `git status --short --branch` 顯示位於 `main` 且工作樹乾淨。
- `git log -3 --show-signature --stat` 可辨識三筆 Bootstrap Commit 與內容順序。
- `git remote -v` 與核准的 Public GitHub Repository 一致。
- `node --version`、`yarn --version` 與 `package.json#packageManager` 符合計畫。
- `yarn install --immutable`、`yarn typecheck`、`yarn lint`、`yarn test`、`yarn build`、`yarn test:e2e`、`yarn format:check` 實際成功。
- GitHub Actions 在 Bootstrap push 後成功；若 GitHub 尚未建立，必須明確標示未完成，不能開始需要 PR／CI 的 Ticket 交付流程。
- `.data/`、Token、SQLite、Evidence 原始輸出與其他疑似 secret 不在 `git ls-files` 中。

## 已知風險與停止條件

- NVM 的全域 default 目前仍是 Node.js 20；進入 Repository 後必須執行 `nvm use`，不得依賴 shell 的預設版本。Node.js 24.20.0 已透過 NVM 安裝。
- 目前 `yarn` 是 Classic `1.22.22`；不能用它產生專案 lockfile，必須先透過 Corepack 使用核准的 Yarn 4。
- 目前沒有 `gh` 指令；在 GitHub 登入與 Repository 存取權完成驗證前，不得 push 或聲稱遠端 Bootstrap 已完成。
- MCP TypeScript SDK 與 MCP specification 仍可能演進；Bootstrap 只接受執行當日 stable v2，並以 lockfile 凍結。若只有 prerelease 可用，停止並重新決策。
- 原生 SQLite 相依性延至 Ticket 02；屆時必須另外驗證 Node.js 24、Yarn 與 CI runner 的 native module 相容性。
- 既有 Spec、Ticket、`CONTEXT.md` 或 ADR 若在 Bootstrap 前改變，必須重新顯示差異並確認本計畫仍成立。

## 核准結果

專案擁有者已核准 GitHub owner、Repository 名稱、URL、Public visibility、Apache-2.0 License，以及本計畫所列的 Bootstrap 範圍、工具鏈與停止條件。沒有新增 ADR 的必要。

Bootstrap 解析依賴時確認 MCP Node adapter 需要應用直接提供 `hono` peer，因此加入相容的 Hono 4。專案擁有者在 Commit 前進一步要求試用 Vite 全家餐，計畫因此加入 React 19、Vite 8、Vitest 5、Oxlint、Oxfmt、Testing Library、MSW 與 Playwright，並以可建置、可測試但不含工作流行為的 `mcp-ui` shell 驗證工具鏈。格式化採 Oxfmt 的 Prettier-compatible workflow，接受其仍為 `0.x` 的版本成熟度風險並以 lockfile 鎖定實際版本。Router、Server State、Client State、表單與 UI system 維持 Just-in-time 引入。專案擁有者隨後核准依內容建立三筆 Bootstrap Commit，以保留可讀歷史。第一次 Push 的 GitHub Actions 顯示 `setup-node` 的 Yarn cache 在 Corepack 啟用前呼叫系統 Yarn 1，因此專案擁有者另行核准一筆 `fix(ci)` correction commit 與第二次 Push；修正移除該 cache，仍由後續明確的 `corepack enable` 與 `yarn install --immutable` 建立環境。
