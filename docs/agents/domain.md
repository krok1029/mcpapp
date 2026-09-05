# 領域文件

本專案採用單一脈絡（single-context）的領域文件配置。

## 探索程式碼前應閱讀

- Repository 根目錄的 `CONTEXT.md`
- `docs/adr/` 中與本次工作相關的 ADR

如果這些檔案尚不存在，直接繼續，不需提示缺少文件，也不要預先建立。領域術語或架構決策真正確立時，再由 domain-modeling 流程建立。

## 檔案結構

```text
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

## 使用 Glossary 定義的詞彙

Issue 標題、重構提案、假設與測試名稱等內容，應使用 `CONTEXT.md` 定義的領域詞彙。

不要改用 Glossary 明確排除的同義詞。如果需要的概念尚未定義，應先判斷是否正在創造專案並未使用的語言；若確實存在詞彙缺口，記錄並交由 domain-modeling 流程處理。

## 標示與 ADR 的衝突

如果提出的工作違反既有 ADR，必須明確指出衝突，不得默默覆蓋既有決策。
