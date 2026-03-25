# 資料維護系統 (3-tier Web App)

React + Node.js + SQL Server

## 快速啟動

### 1. 初始化資料庫
在 SQL Server 執行 `db/init.sql`

### 2. 啟動 Backend
```bash
cd backend
npm install
npm run dev
# 伺服器運行於 http://localhost:3001
```

### 3. 啟動 Frontend
```bash
cd frontend
npm install
npm run dev
# 開啟 http://localhost:3000
```

## 預設帳號
| 帳號    | 密碼     |
|---------|----------|
| admin   | admin123 |
| user01  | pass001  |
| user02  | pass002  |

## 功能
- 登入驗證
- 客戶維護 (cust)
- 廠商維護 (fact)
- 商品維護 (item) - 含廠商下拉選單
- 用戶維護 (user)

每個模組支援：查詢、新增、修改、刪除
