const { connectDB } = require('./db');

async function test() {
  const conn = await connectDB();

  // ตัวอย่าง query: ดึง users ทั้งหมด
  const [rows] = await conn.execute('SELECT * FROM users');
  console.log(rows);

  await conn.end();
}

test();
