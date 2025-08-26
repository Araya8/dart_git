// app.js
require('dotenv').config();
const express = require('express');
const { connectDB } = require('./db');

const app = express();
app.use(express.json());

/* ================= Login ================= */
app.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  const conn = await connectDB();

  // plain password
  const [rows] = await conn.execute(
    'SELECT id, username FROM users WHERE username=? AND password=? LIMIT 1',
    [username, password]
  );

  await conn.end();
  if (rows.length === 0) return res.status(401).json({ error: 'invalid credentials' });

  res.json({ user: rows[0] }); // TODO: generate token ถ้าต้องการ
});

/* ================= Show All ================= */
app.get('/users/:userId/expenses', async (req, res) => {
  const userId = Number(req.params.userId || 0);
  if (!userId) return res.status(400).json({ error: 'invalid userId' });

  const conn = await connectDB();
  try {
    const [rows] = await conn.execute(
      'SELECT id, item, paid, `date` FROM expenses WHERE user_id=? ORDER BY `date` DESC',
      [userId]
    );
    const total = rows.reduce((s, r) => s + Number(r.paid || 0), 0);
    res.json({ items: rows, total });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await conn.end();
  }
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));