// app.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const readline = require('readline');

/* === MySQL Config (ตรงกับ db.sql; root ไม่มีรหัส) === */
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',      // root ไม่มีรหัส
  database: process.env.DB_NAME || 'expense_app',
  port: Number(process.env.DB_PORT || 3306),
  charset: 'utf8mb4'
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, (ans) => res((ans || '').trim())));

let currentUser = null;

async function connectDB() { return await mysql.createConnection(dbConfig); }
function fmt(d){ return d instanceof Date ? d.toISOString().replace('T',' ').slice(0,19) : String(d); }

function menu(){
  console.log('\n======== Expense Tracking App ========');
  console.log(`Welcome ${currentUser.username}`);
  console.log('1. All expenses');
  console.log("2. Today\'s expense");
  console.log('3. Search expense');
  console.log('4. Add new expense');
  console.log('5. Delete an expense');
  console.log('6. Exit');
  process.stdout.write('Choose: ');
}

/* === Login (PLAIN password ตาม db.sql) === */
async function login(){
  console.log('===== Login =====');
  const u = await ask('Username: ');
  const p = await ask('Password: ');
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
/* ================= Features Show All ================= */


/* ================= Features Show Today================= */


/* ================= Features searchExpense================= */


/* ================= Features addExpense================= */


/* ================= Features deleteById================= */

