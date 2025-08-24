// node_api/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { pool, usePasswordHash } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

/* ===== Helpers ===== */
function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
}
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

/* ===== Auth ===== */
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'missing credentials' });

    const hash = await usePasswordHash();
    const sql = hash
      ? "SELECT id, username FROM users WHERE username=? AND password_hash = SHA2(?,256) LIMIT 1"
      : "SELECT id, username FROM users WHERE username=? AND password=? LIMIT 1";

    const [rows] = await pool.query(sql, [username, password]);
    if (rows.length === 0) return res.status(401).json({ error: 'invalid credentials' });

    const user = rows[0];
    const token = signToken({ userId: user.id, username: user.username });
    res.json({ token, user: { id: user.id, username: user.username }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/* ===== Expenses CRUD ===== */
app.get('/expenses', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, item, paid, date FROM expenses WHERE user_id=? ORDER BY date DESC',
      [req.user.userId]
    );
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

app.get('/expenses/today', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, item, paid, date FROM expenses WHERE user_id=? AND DATE(date)=CURDATE() ORDER BY date DESC',
      [req.user.userId]
    );
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

app.get('/expenses/search', authMiddleware, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const [rows] = await pool.query(
      'SELECT id, item, paid, date FROM expenses WHERE user_id=? AND item LIKE ? ORDER BY date DESC',
      [req.user.userId, `%${q}%`]
    );
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

app.post('/expenses', authMiddleware, async (req, res) => {
  try {
    const { item, paid } = req.body || {};
    const amt = Number(paid);
    if (!item || Number.isNaN(amt) || amt < 0) return res.status(400).json({ error: 'invalid payload' });

    const [result] = await pool.query(
      'INSERT INTO expenses (user_id, item, paid, date) VALUES (?, ?, ?, NOW())',
      [req.user.userId, String(item), amt]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

app.delete('/expenses/:id', authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    const [result] = await pool.query(
      'DELETE FROM expenses WHERE id=? AND user_id=?',
      [id, req.user.userId]
    );
    res.json({ deleted: result.affectedRows > 0 });
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => console.log(`✅ API running at http://localhost:${PORT}`));
