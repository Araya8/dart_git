//app.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const readline = require('readline');

// ตั้งค่าการเชื่อมต่อ MySQL
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "", // ใส่รหัสผ่าน MySQL ของคุณ
  database: "expense_app"
};

// สร้าง interface สำหรับการรับ input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let currentUser = null;

// ฟังก์ชันเชื่อมต่อฐานข้อมูล
async function connectDB() {
  return await mysql.createConnection(dbConfig);
}

// ฟังก์ชันแสดงเมนูหลัก
function showMainMenu() {
  console.log('\n======== Expense Tracking App ========');
  console.log(`Welcome ${currentUser.username}`);
  console.log('1. All expenses');
  console.log('2. Today\'s expense');
  console.log('3. Search expense');
  console.log('4. Add new expense');
  console.log('5. Delete an expense');
  console.log('6. Exit');
  console.log('Choose...');
}

// ฟังก์ชันล็อกอิน
async function login() {
  return new Promise((resolve) => {
    console.log('===== Login =====');
    rl.question('Username: ', async (username) => {
      rl.question('Password: ', async (password) => {
        const conn = await connectDB();
        
        try {
          const [rows] = await conn.execute(
            'SELECT id, username FROM users WHERE username=? AND password=? LIMIT 1',
            [username, password]
          );
          
          await conn.end();
          
          if (rows.length === 0) {
            console.log('Invalid credentials. Please try again.');
            resolve(false);
          } else {
            currentUser = rows[0];
            resolve(true);
          }
        } catch (error) {
          console.error('Login error:', error);
          resolve(false);
        }
      });
    });
  });
}

// ฟังก์ชันแสดงรายการทั้งหมด (แก้ไขการจัดรูปแบบวันที่และส่วนหัว)
async function showAllExpenses() {
  console.log('\nChoose...1');
  console.log('------------- All expenses -------------');
  
  const conn = await connectDB();
  
  try {
    const [rows] = await conn.execute(`
      SELECT id, item, paid, DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s.000') as date 
      FROM expenses 
      WHERE user_id = ?
      ORDER BY id ASC
    `, [currentUser.id]);
    
    let total = 0;
    rows.forEach((item) => {
      console.log(`${item.id}. ${item.item} : ${item.paid}฿ : ${item.date}`);
      total += item.paid;
    });
    console.log(`Total expenses = ${total}฿`);
  } catch (error) {
    console.error('Error fetching expenses:', error);
  } finally {
    await conn.end();
    showMainMenu();
  }
}

// ฟังก์ชันแสดงรายการวันนี้ (แก้ไขการจัดรูปแบบวันที่และส่วนหัว)
async function showTodayExpenses() {
  console.log('\nChoose...2');
  console.log('------------- Today\'s expenses -------------');
  
  const conn = await connectDB();
  
  try {
    const [rows] = await conn.execute(`
      SELECT id, item, paid, DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s.000') as date 
      FROM expenses 
      WHERE user_id = ? AND DATE(date) = CURDATE()
      ORDER BY id ASC
    `, [currentUser.id]);
    
    let total = 0;
    rows.forEach((item) => {
      console.log(`${item.id}. ${item.item} : ${item.paid}฿ : ${item.date}`);
      total += item.paid;
    });
    console.log(`Today's total expenses = ${total}฿`);
  } catch (error) {
    console.error('Error fetching today expenses:', error);
  } finally {
    await conn.end();
    showMainMenu();
  }
}

// ฟังก์ชันค้นหารายการ (แก้ไขการจัดรูปแบบวันที่)
async function searchExpenses() {
  console.log('\nChoose...3');
  
  return new Promise((resolve) => {
    rl.question('Item to search: ', async (keyword) => {
      const conn = await connectDB();
      
      try {
        const [rows] = await conn.execute(`
          SELECT id, item, paid, DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s.000') as date 
          FROM expenses 
          WHERE user_id = ? AND item LIKE ?
          ORDER BY id ASC
        `, [currentUser.id, `%${keyword}%`]);
        
        if (rows.length === 0) {
            console.log(`No item: ${keyword}`);
        } else {
            rows.forEach((item) => {
                console.log(`${item.id}. ${item.item} : ${item.paid}฿ : ${item.date}`);
            });
        }
        
      } catch (error) {
        console.error('Error searching expenses:', error);
      } finally {
        await conn.end();
        showMainMenu();
        resolve();
      }
    });
  });
}

// ฟังก์ชันเพิ่มรายการใหม่ (ไม่มีการเปลี่ยนแปลงตามคำขอ)
async function addNewExpense() {
  console.log('\nChoose...4');
  console.log('--- Add new item ---');
  
  return new Promise((resolve) => {
    rl.question('Item: ', async (item) => {
      rl.question('Paid: ', async (amount) => {
        const conn = await connectDB();
        
        try {
          await conn.execute(
            'INSERT INTO expenses (user_id, item, paid, date) VALUES (?, ?, ?, NOW())',
            [currentUser.id, item, parseInt(amount)]
          );
          
          console.log('Inserted!');
        } catch (error) {
          console.error('Error adding expense:', error);
        } finally {
          await conn.end();
          showMainMenu();
          resolve();
        }
      });
    });
  });
}

// ฟังก์ชันลบรายการ (แก้ไขการแสดงผลหลังลบ)
async function deleteExpense() {
  console.log('\nChoose...5');
  console.log('==== Delete an item ====');
  
  return new Promise((resolve) => {
    rl.question('Item id: ', async (id) => {
      const conn = await connectDB();
      
      try {
        const [result] = await conn.execute(
          'DELETE FROM expenses WHERE id = ? AND user_id = ?',
          [id, currentUser.id]
        );
        
        if (result.affectedRows > 0) {
          console.log('Deleted!');
        } else {
          console.log('No item found with id = ' + id);
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
      } finally {
        await conn.end();
        
        // หลังจากลบ ให้แสดงรายการทั้งหมด
        await showAllExpenses();
        resolve();
      }
    });
  });
}

// ฟังก์ชันหลัก (แก้ไขการแสดงผลตอนเริ่มต้น)
async function main() {
  // ล็อกอิน
  let loggedIn = false;
  while (!loggedIn) {
    loggedIn = await login();
  }
  
  // แสดงเมนูหลัก
  showMainMenu();
  
  // รับคำสั่งจากผู้ใช้
  rl.on('line', async (input) => {
    switch (input.trim()) {
      case '1':
        await showAllExpenses();
        break;
      case '2':
        await showTodayExpenses();
        break;
      case '3':
        await searchExpenses();
        break;
      case '4':
        await addNewExpense();
        break;
      case '5':
        await deleteExpense();
        break;
      case '6':
        console.log('\nChoose...6');
        console.log('--- Bye ---');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Invalid choice. Please try again.');
        showMainMenu();
        break;
    }
  });
}

// เริ่มต้นแอปพลิเคชัน
main().catch(console.error);

