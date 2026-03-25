const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

// GET /api/item
router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    const pool = await getPool();
    let query = `
      SELECT i.item_id, i.item_name, i.fact_code, f.fact_name
      FROM item i
      LEFT JOIN fact f ON i.fact_code = f.fact_id
    `;
    if (search) query += ' WHERE i.item_id LIKE @search OR i.item_name LIKE @search';
    query += ' ORDER BY i.item_id';
    const request = pool.request();
    if (search) request.input('search', sql.NVarChar, `%${search}%`);
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// POST /api/item
router.post('/', async (req, res) => {
  const { item_id, item_name, fact_code } = req.body;
  if (!item_id || !item_name) return res.status(400).json({ message: '商品代碼和名稱為必填' });
  try {
    const pool = await getPool();
    await pool.request()
      .input('item_id', sql.NVarChar, item_id)
      .input('item_name', sql.NVarChar, item_name)
      .input('fact_code', sql.NVarChar, fact_code || null)
      .query('INSERT INTO item (item_id, item_name, fact_code) VALUES (@item_id, @item_name, @fact_code)');
    res.status(201).json({ message: '新增成功' });
  } catch (err) {
    if (err.number === 2627) return res.status(409).json({ message: '商品代碼已存在' });
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// PUT /api/item/:id
router.put('/:id', async (req, res) => {
  const { item_name, fact_code } = req.body;
  if (!item_name) return res.status(400).json({ message: '商品名稱為必填' });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('item_id', sql.NVarChar, req.params.id)
      .input('item_name', sql.NVarChar, item_name)
      .input('fact_code', sql.NVarChar, fact_code || null)
      .query('UPDATE item SET item_name=@item_name, fact_code=@fact_code WHERE item_id=@item_id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: '找不到該商品' });
    res.json({ message: '修改成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// DELETE /api/item/:id
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('item_id', sql.NVarChar, req.params.id)
      .query('DELETE FROM item WHERE item_id=@item_id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: '找不到該商品' });
    res.json({ message: '刪除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;
