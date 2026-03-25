const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

// GET /api/user
router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    const pool = await getPool();
    let query = 'SELECT user_id, user_name, password FROM [user]';
    if (search) query += ' WHERE user_id LIKE @search OR user_name LIKE @search';
    query += ' ORDER BY user_id';
    const request = pool.request();
    if (search) request.input('search', sql.NVarChar, `%${search}%`);
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// POST /api/user
router.post('/', async (req, res) => {
  const { user_id, user_name, password } = req.body;
  if (!user_id || !user_name || !password) return res.status(400).json({ message: '所有欄位為必填' });
  try {
    const pool = await getPool();
    await pool.request()
      .input('user_id', sql.NVarChar, user_id)
      .input('user_name', sql.NVarChar, user_name)
      .input('password', sql.NVarChar, password)
      .query('INSERT INTO [user] (user_id, user_name, password) VALUES (@user_id, @user_name, @password)');
    res.status(201).json({ message: '新增成功' });
  } catch (err) {
    if (err.number === 2627) return res.status(409).json({ message: '用戶代碼已存在' });
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// PUT /api/user/:id
router.put('/:id', async (req, res) => {
  const { user_name, password } = req.body;
  if (!user_name || !password) return res.status(400).json({ message: '所有欄位為必填' });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('user_id', sql.NVarChar, req.params.id)
      .input('user_name', sql.NVarChar, user_name)
      .input('password', sql.NVarChar, password)
      .query('UPDATE [user] SET user_name=@user_name, password=@password WHERE user_id=@user_id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: '找不到該用戶' });
    res.json({ message: '修改成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// DELETE /api/user/:id
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('user_id', sql.NVarChar, req.params.id)
      .query('DELETE FROM [user] WHERE user_id=@user_id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: '找不到該用戶' });
    res.json({ message: '刪除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;
