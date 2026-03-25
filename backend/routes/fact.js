const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

// GET /api/fact
router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    const pool = await getPool();
    let query = 'SELECT fact_id, fact_name, remark FROM fact';
    if (search) query += ' WHERE fact_id LIKE @search OR fact_name LIKE @search';
    query += ' ORDER BY fact_id';
    const request = pool.request();
    if (search) request.input('search', sql.NVarChar, `%${search}%`);
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// POST /api/fact
router.post('/', async (req, res) => {
  const { fact_id, fact_name, remark } = req.body;
  if (!fact_id || !fact_name) return res.status(400).json({ message: '廠商代碼和名稱為必填' });
  try {
    const pool = await getPool();
    await pool.request()
      .input('fact_id', sql.NVarChar, fact_id)
      .input('fact_name', sql.NVarChar, fact_name)
      .input('remark', sql.NVarChar, remark || null)
      .query('INSERT INTO fact (fact_id, fact_name, remark) VALUES (@fact_id, @fact_name, @remark)');
    res.status(201).json({ message: '新增成功' });
  } catch (err) {
    if (err.number === 2627) return res.status(409).json({ message: '廠商代碼已存在' });
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// PUT /api/fact/:id
router.put('/:id', async (req, res) => {
  const { fact_name, remark } = req.body;
  if (!fact_name) return res.status(400).json({ message: '廠商名稱為必填' });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('fact_id', sql.NVarChar, req.params.id)
      .input('fact_name', sql.NVarChar, fact_name)
      .input('remark', sql.NVarChar, remark || null)
      .query('UPDATE fact SET fact_name=@fact_name, remark=@remark WHERE fact_id=@fact_id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: '找不到該廠商' });
    res.json({ message: '修改成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// DELETE /api/fact/:id
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('fact_id', sql.NVarChar, req.params.id)
      .query('DELETE FROM fact WHERE fact_id=@fact_id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: '找不到該廠商' });
    res.json({ message: '刪除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;
