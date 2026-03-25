const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { user_id, password } = req.body;
  if (!user_id || !password) {
    return res.status(400).json({ message: '請輸入帳號和密碼' });
  }
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('user_id', sql.NVarChar, user_id)
      .input('password', sql.NVarChar, password)
      .query('SELECT user_id, user_name FROM [user] WHERE user_id = @user_id AND password = @password');

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: '帳號或密碼錯誤' });
    }
    res.json({ user: result.recordset[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;
