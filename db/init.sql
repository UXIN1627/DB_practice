-- ==============================================
-- 初始化腳本：建立資料表並插入測試資料
-- Database: gemio15
-- ==============================================

USE gemio15;
GO

-- =====================
-- Table: user
-- =====================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user' AND xtype='U')
BEGIN
    CREATE TABLE [user] (
        user_id   NVARCHAR(20)  NOT NULL PRIMARY KEY,
        user_name NVARCHAR(50)  NOT NULL,
        password  NVARCHAR(50)  NOT NULL
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM [user])
BEGIN
    INSERT INTO [user] (user_id, user_name, password) VALUES
        ('admin',  N'系統管理員', 'admin123'),
        ('user01', N'測試用戶一', 'pass001'),
        ('user02', N'測試用戶二', 'pass002');
END
GO

-- =====================
-- Table: cust
-- =====================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='cust' AND xtype='U')
BEGIN
    CREATE TABLE cust (
        cust_id   NVARCHAR(20)  NOT NULL PRIMARY KEY,
        cust_name NVARCHAR(100) NOT NULL,
        remark    NVARCHAR(255) NULL
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM cust)
BEGIN
    INSERT INTO cust (cust_id, cust_name, remark) VALUES
        ('C001', N'台灣科技股份有限公司', N'長期合作客戶'),
        ('C002', N'全球貿易有限公司',     N'批發採購為主'),
        ('C003', N'新興電商平台',         N'網路銷售通路');
END
GO

-- =====================
-- Table: fact
-- =====================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='fact' AND xtype='U')
BEGIN
    CREATE TABLE fact (
        fact_id   NVARCHAR(20)  NOT NULL PRIMARY KEY,
        fact_name NVARCHAR(100) NOT NULL,
        remark    NVARCHAR(255) NULL
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM fact)
BEGIN
    INSERT INTO fact (fact_id, fact_name, remark) VALUES
        ('F001', N'優質供應商股份有限公司', N'電子零件供應'),
        ('F002', N'東方製造廠',             N'機械零件製造'),
        ('F003', N'綠能科技廠商',           N'環保材料供應');
END
GO

-- =====================
-- Table: item
-- =====================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='item' AND xtype='U')
BEGIN
    CREATE TABLE item (
        item_id   NVARCHAR(20)  NOT NULL PRIMARY KEY,
        item_name NVARCHAR(100) NOT NULL,
        fact_code NVARCHAR(20)  NULL,
        CONSTRAINT FK_item_fact FOREIGN KEY (fact_code) REFERENCES fact(fact_id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM item)
BEGIN
    INSERT INTO item (item_id, item_name, fact_code) VALUES
        ('I001', N'高效能處理器',   'F001'),
        ('I002', N'精密齒輪組件',   'F002'),
        ('I003', N'太陽能電池板',   'F003');
END
GO
