// bin/dart_today.dart — Dart CLI แสดง Today's expenses เท่านั้น
import 'dart:io';
import 'package:mysql1/mysql1.dart';

/* ===== Config ===== */
const dbHost = '127.0.0.1';
const dbPort = 3306;          // ถ้า MySQL ใช้ 3307 ให้เปลี่ยนเป็น 3307
const dbUser = 'root';
const String? dbPass = null;  // root ไม่มีรหัสต้องเป็น null
const dbName = 'expense_app';
const String? DEMO_TODAY = '2025-08-20'; // ใช้วัน Demo

/* ===== Helpers ===== */
String _prompt(String label) {
  stdout.write('$label: ');
  return stdin.readLineSync()?.trim() ?? '';
}

/* ===== Main ===== */
Future<void> main() async {
  // connect
  late MySqlConnection conn;
  try {
    conn = await MySqlConnection.connect(ConnectionSettings(
      host: dbHost, port: dbPort,
      user: dbUser, password: dbPass, db: dbName,
    ));
  } catch (e) {
    stderr.writeln('❌ Connect failed: $e');
    return;
  }

  // login
  stdout.writeln('===== Login =====');
  final username = _prompt('Username');
  final password = _prompt('Password');
  final auth = await conn.query(
    'SELECT id FROM users WHERE username=? AND password=? LIMIT 1',
    [username, password],
  );
  if (auth.isEmpty) {
    stdout.writeln('Invalid credentials. Bye!');
    await conn.close();
    return;
  }
  final userId = auth.first[0] as int;

  // show today only
  await showToday(conn, userId);

  await conn.close();
}

/* ===== Feature: Today's expenses ===== */
Future<void> showToday(MySqlConnection conn, int userId) async {
  final sql = (DEMO_TODAY == null)
      ? 'SELECT id, item, paid, `date` FROM expenses '
        'WHERE user_id=? AND DATE(`date`)=CURDATE() ORDER BY `date` DESC'
      : 'SELECT id, item, paid, `date` FROM expenses '
        'WHERE user_id=? AND DATE(`date`)=? ORDER BY `date` DESC';
  final params = (DEMO_TODAY == null) ? [userId] : [userId, DEMO_TODAY];

  final rows = await conn.query(sql, params);
  if (rows.isEmpty) {
    stdout.writeln("No items paid today.");
    return;
  }


}

/* ================= Features searchExpense================= */
Future<void> searchExpense(MySqlConnection conn, int userId) async {

}

/* ================= Features addExpense================= */
Future<void> addExpense(MySqlConnection conn, int userId) async {
  final title = _prompt('Enter title');
  final amount = double.parse(_prompt('Enter amount'));
  final date = _prompt('Enter date (YYYY-MM-DD)');

  await conn.query(
    'INSERT INTO expenses (user_id, title, amount, date) VALUES (?, ?, ?, ?)',
    [userId, title, amount, date],
  );
  stdout.writeln('Expense added successfully!');
}

/* ================= Features deleteById================= */
Future<void> deleteById(MySqlConnection conn, int userId) async {

=======
  stdout.writeln("------------ Today's expenses -----------");
  int total = 0;
  for (final r in rows) {
    final id = r[0] as int;
    final item = r[1] as String;
    final paid = r[2] as int;
    final dateStr = r[3].toString();
    total += paid;
    stdout.writeln('$id. $item : ${paid}฿ : $dateStr');
  }
  stdout.writeln('Total expenses = ${total}฿');

}


String _promptHidden(String label) {
  stdout.write('$label: ');
  try {
    stdin.echoMode = false;
  } catch (_) {}
  final s = stdin.readLineSync()!.trim();
  try {
    stdin.echoMode = true;
  } catch (_) {}
  stdout.writeln();
  return s;

}
