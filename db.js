// node_api/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function usePasswordHash() {
  const [rows] = await pool.query("SHOW COLUMNS FROM users LIKE 'password_hash'");
  return rows.length > 0;
}

module.exports = { pool, usePasswordHash };
