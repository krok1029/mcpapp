# 只接受受控執行產生的自動化證據

自動化 Verification Evidence 必須由 McpApp 的受控工具實際執行並記錄指令、工作目錄、時間、結束碼、輸出、Git HEAD、工作樹狀態與 Stack Profile；Host Agent 的文字敘述不能單獨成為證據。人工或視覺驗證則必須由專案擁有者明確確認。大型輸出可以外部保存，但紀錄中必須保留摘要、位置與雜湊。
