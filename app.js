// app.js — Node CLI สำหรับ expense_app (users.password = plain)
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
  try{
    const [rows] = await conn.execute(
      'SELECT id, username FROM users WHERE username=? AND password=? LIMIT 1',
      [u, p]
    );
    if(!rows.length){ console.log('Invalid credentials.'); return false; }
    currentUser = rows[0]; return true;
  } finally { await conn.end(); }
}

/* === Features === */
async function showAll(){
  const conn = await connectDB();
  try{
    const [rows] = await conn.execute(
      'SELECT id,item,paid,date FROM expenses WHERE user_id=? ORDER BY date DESC',
      [currentUser.id]
    );
    if(!rows.length){ console.log('No items.'); return; }
    let total=0; console.log('--- All expenses ---');
    rows.forEach(r=>{ console.log(`${r.id}. ${r.item} : ${r.paid}฿ : ${fmt(r.date)}`); total+=Number(r.paid); });
    console.log(`Total = ${total}฿`);
  } finally { await conn.end(); menu(); }
}

async function showToday(){
  const conn = await connectDB();
  try{
    const [rows] = await conn.execute(
      `SELECT id,item,paid,date FROM expenses
       WHERE user_id=? AND DATE(date)=CURDATE() ORDER BY date DESC`,
      [currentUser.id]
    );
    if(!rows.length){ console.log('No items paid today.'); return; }
    let total=0; console.log(`--- Today's expenses ---`);
    rows.forEach(r=>{ console.log(`${r.id}. ${r.item} : ${r.paid}฿ : ${fmt(r.date)}`); total+=Number(r.paid);});
    console.log(`Today's total = ${total}฿`);
  } finally { await conn.end(); menu(); }
}

async function search(){
  const kw = await ask('Search for: ');
  const conn = await connectDB();
  try{
    const [rows] = await conn.execute(
      `SELECT id,item,paid,date FROM expenses
       WHERE user_id=? AND item LIKE ? ORDER BY date DESC`,
      [currentUser.id, `%${kw}%`]
    );
    if(!rows.length){ console.log(`No item containing "${kw}".`); return; }
    let total=0; console.log(`--- Results for "${kw}" ---`);
    rows.forEach(r=>{ console.log(`${r.id}. ${r.item} : ${r.paid}฿ : ${fmt(r.date)}`); total+=Number(r.paid);});
    console.log(`Total = ${total}฿`);
  } finally { await conn.end(); menu(); }
}

async function addNew(){
  const item = await ask('Item: ');
  const amt  = Number(await ask('Amount (฿): '));
  if(!item || Number.isNaN(amt) || amt<0){ console.log('Invalid input.'); return menu(); }
  const conn = await connectDB();
  try{
    await conn.execute(
      'INSERT INTO expenses (user_id,item,paid,date) VALUES (?,?,?,NOW())',
      [currentUser.id, item, amt]
    );
    console.log('Added!');
  } finally { await conn.end(); menu(); }
}

async function delItem(){
  const id = Number(await ask('Expense id to delete: '));
  if(!id){ console.log('Invalid id.'); return menu(); }
  const conn = await connectDB();
  try{
    const [r] = await conn.execute(
      'DELETE FROM expenses WHERE id=? AND user_id=?',
      [id, currentUser.id]
    );
    console.log(r.affectedRows>0 ? 'Deleted!' : 'Not found.');
  } finally { await conn.end(); await showAll(); }
}

/* === Main === */
async function main(){
  while(!(await login())) {}
  console.clear(); menu();
  rl.on('line', async (x)=>{
    switch((x||'').trim()){
      case '1': await showAll(); break;
      case '2': await showToday(); break;
      case '3': await search(); break;
      case '4': await addNew(); break;
      case '5': await delItem(); break;
      case '6': console.log('Bye!'); rl.close(); process.exit(0);
      default: console.log('Invalid choice.'); menu();
    }
  });
}
main().catch(e=>{ console.error('Fatal:', e); process.exit(1); });
