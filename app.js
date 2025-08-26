// app.js — Expense CLI Template (Node.js + MySQL)
//login + เมนู 1–6 พร้อม TODO ในแต่ละฟังก์ชันให้เพื่อนๆเติม

require('dotenv').config();
const mysql = require('mysql2/promise');
const readline = require('readline');

/* ================= Config ================= */
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'expense_app',
  port: Number(process.env.DB_PORT || 3306),
  charset: 'utf8mb4'
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, (ans) => res(ans.trim())));

let currentUser = null; // { id, username }

/* ================= DB Helper ================= */
async function connectDB() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (e) {
    console.error('❌ Cannot connect MySQL:', e.message || e);
    process.exit(1);
  }
}

async function detectUseHash(conn) {
  const [cols] = await conn.execute("SHOW COLUMNS FROM users LIKE 'password_hash'");
  return cols.length > 0; // true => ใช้ SHA2
}

function formatDate(d) {
  return d instanceof Date ? d.toISOString().replace('T', ' ').slice(0, 19) : String(d);
}

/* ================= UI ================= */
function showMainMenu() {
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

/* ================= Login ================= */
async function login() {
  console.log('===== Login =====');
  const username = await ask('Username: ');
  const password = await ask('Password: ');

  const conn = await connectDB();
  try {
    const useHash = await detectUseHash(conn);
    const sql = useHash
      ? 'SELECT id, username FROM users WHERE username=? AND password_hash = SHA2(?,256) LIMIT 1'
      : 'SELECT id, username FROM users WHERE username=? AND password=? LIMIT 1';

    const [rows] = await conn.execute(sql, [username, password]);
    if (!rows.length) {
      console.log('Invalid credentials. Please try again.');
      return false;
    }
    currentUser = rows[0];
    return true;
  } catch (e) {
    console.error('Login error:', e.message || e);
    return false;
  } finally {
    await conn.end();
  }
}

/* ================= Features (Templates) ================= */

// 1) Show all
async function showAllExpenses() {
  const conn = await connectDB();
  try {
    // TODO: ทีม A เติม logic แสดงรายการทั้งหมด
    // ตัวอย่างโค้ด (ปลดคอมเมนต์เพื่อใช้จริง):
    // const [rows] = await conn.execute(
    //   'SELECT id, item, paid, date FROM expenses WHERE user_id=? ORDER BY date DESC',
    //   [currentUser.id]
    // );
    // if (!rows.length) { console.log('No items.'); return; }
    // let total = 0;
    // rows.forEach(it => { console.log(`${it.id}. ${it.item} : ${it.paid}฿ : ${formatDate(it.date)}`); total += Number(it.paid); });
    // console.log(`Total = ${total}฿`);

    console.log('[TODO] Show All — ใส่โค้ด query จากตาราง expenses ที่นี่');
  } catch (e) {
    console.error('Error (Show All):', e.message || e);
  } finally {
    await conn.end();
    showMainMenu();
  }
}

// 2) Show today
async function showTodayExpenses() {
  const conn = await connectDB();
  try {
    // TODO: ทีม B เติม logic แสดงรายการของ "วันนี้"
    // ตัวอย่าง:
    // const [rows] = await conn.execute(
    //   `SELECT id, item, paid, date FROM expenses
    //     WHERE user_id=? AND DATE(date)=CURDATE()
    //     ORDER BY date DESC`, [currentUser.id]
    // );
    // if (!rows.length) { console.log('No items paid today.'); return; }
    // let total = 0;
    // rows.forEach(it => { console.log(`${it.id}. ${it.item} : ${it.paid}฿ : ${formatDate(it.date)}`); total += Number(it.paid); });
    // console.log(`Today's total = ${total}฿`);

    console.log('[TODO] Show Today — ใส่โค้ด SELECT ... DATE(date)=CURDATE() ที่นี่');
  } catch (e) {
    console.error('Error (Today):', e.message || e);
  } finally {
    await conn.end();
    showMainMenu();
  }
}

// 3) Search
async function searchExpenses() {
  const kw = await ask('Search keyword: ');
  const conn = await connectDB();
  try {
    // TODO: ทีม C เติม logic ค้นหา
    // ตัวอย่าง:
    // const [rows] = await conn.execute(
    //   `SELECT id, item, paid, date FROM expenses
    //      WHERE user_id=? AND item LIKE ?
    //      ORDER BY date DESC`,
    //   [currentUser.id, `%${kw}%`]
    // );
    // if (!rows.length) { console.log(`No item containing "${kw}".`); return; }
    // let total = 0;
    // rows.forEach(it => { console.log(`${it.id}. ${it.item} : ${it.paid}฿ : ${formatDate(it.date)}`); total += Number(it.paid); });
    // console.log(`Total = ${total}฿`);

    console.log(`[TODO] Search — ค้นหา item LIKE "%${kw}%" ที่นี่`);
  } catch (e) {
    console.error('Error (Search):', e.message || e);
  } finally {
    await conn.end();
    showMainMenu();
  }
}

// 4) Add
async function addNewExpense() {
  const item = await ask('Item: ');
  const amtStr = await ask('Amount (฿): ');
  const amt = Number(amtStr);
  if (!item || Number.isNaN(amt) || amt < 0) {
    console.log('Invalid input.');
    showMainMenu(); return;
  }

  const conn = await connectDB();
  try {
    // TODO: ทีม D เติม logic เพิ่มรายการ
    // ตัวอย่าง:
    // await conn.execute(
    //   'INSERT INTO expenses (user_id, item, paid, date) VALUES (?, ?, ?, NOW())',
    //   [currentUser.id, item, amt]
    // );
    // console.log('Added!');

    console.log('[TODO] Add — INSERT ลงตาราง expenses ที่นี่');
  } catch (e) {
    console.error('Error (Add):', e.message || e);
  } finally {
    await conn.end();
    showMainMenu();
  }
}

// 5) Delete
async function deleteExpense() {
  const idStr = await ask('Expense id to delete: ');
  const id = Number(idStr);
  if (!id) { console.log('Invalid id.'); showMainMenu(); return; }

  const conn = await connectDB();
  try {
    // TODO: ทีม D เติม logic ลบ
    // ตัวอย่าง:
    // const [r] = await conn.execute(
    //   'DELETE FROM expenses WHERE id=? AND user_id=?',
    //   [id, currentUser.id]
    // );
    // console.log(r.affectedRows > 0 ? 'Deleted!' : 'Not found.');

    console.log('[TODO] Delete — DELETE ด้วย id และ user_id ที่นี่');
  } catch (e) {
    console.error('Error (Delete):', e.message || e);
  } finally {
    await conn.end();
    // ตามสเปก: ลบเสร็จค่อยโชว์ทั้งหมด
    await showAllExpenses();
  }
}

/* ================= Main ================= */
async function main() {
  // login loop
  while (!(await login())) {}
  console.clear();
  showMainMenu();

  // menu loop
  rl.on('line', async (input) => {
    switch ((input || '').trim()) {
      case '1': await showAllExpenses(); break;
      case '2': await showTodayExpenses(); break;
      case '3': await searchExpenses(); break;
      case '4': await addNewExpense(); break;
      case '5': await deleteExpense(); break;
      case '6':
        console.log('Bye!');
        rl.close(); process.exit(0);
      default:
        console.log('Invalid choice.'); showMainMenu();
    }
  });
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});

