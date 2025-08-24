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

/* ================= Show Today ================= */

/* ================= Search ================= */


/* ================= Add ================= */


/* ================= Delete ================= */


/* ================= Start Server ================= */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
