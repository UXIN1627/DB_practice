const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

// GET /api/cust - 查詢全部或依關鍵字搜尋
router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    const pool = await getPool();
    let query = 'SELECT cust_id, cust_name, remark FROM cust';
    if (search) {
      query += ' WHERE cust_id LIKE @search OR cust_name LIKE @search';
    }
    query += ' ORDER BY cust_id';
    const request = pool.request();
    if (search) request.input('search', sql.NVarChar, `%${search}%`);
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// POST /api/cust - 新增
router.post('/', async (req, res) => {
  const { cust_id, cust_name, remark } = req.body;
  if (!cust_id || !cust_name) {
    return res.status(400).json({ message: '客戶代碼和名稱為必填' });
  }
  try {
    const pool = await getPool();
    await pool.request()
      .input('cust_id', sql.NVarChar, cust_id)
      .input('cust_name', sql.NVarChar, cust_name)
      .input('remark', sql.NVarChar, remark || null)
      .query('INSERT INTO cust (cust_id, cust_name, remark) VALUES (@cust_id, @cust_name, @remark)');
    res.status(201).json({ message: '新增成功' });
  } catch (err) {
    if (err.number === 2627) return res.status(409).json({ message: '客戶代碼已存在' });
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// PUT /api/cust/:id - 修改
router.put('/:id', async (req, res) => {
  const { cust_name, remark } = req.body;
  if (!cust_name) return res.status(400).json({ message: '客戶名稱為必填' });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('cust_id', sql.NVarChar, req.params.id)
      .input('cust_name', sql.NVarChar, cust_name)
      .input('remark', sql.NVarChar, remark || null)
      .query('UPDATE cust SET cust_name=@cust_name, remark=@remark WHERE cust_id=@cust_id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: '找不到該客戶' });
    res.json({ message: '修改成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// DELETE /api/cust/:id - 刪除
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('cust_id', sql.NVarChar, req.params.id)
      .query('DELETE FROM cust WHERE cust_id=@cust_id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: '找不到該客戶' });
    res.json({ message: '刪除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;
