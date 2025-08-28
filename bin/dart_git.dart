// bin/dart_git.dart — Dart CLI ใช้กับ db.sql (users.password = plain, root ไม่มีรหัส)
import 'dart:io';
import 'package:mysql1/mysql1.dart';

/* ===== Config ===== */
const dbHost = '127.0.0.1';
const dbPort = 3306;          // ถ้า MySQL ใช้ 3307 ให้เปลี่ยนเป็น 3307
const dbUser = 'root';
const String? dbPass = null;  // <<< สำคัญ: root ไม่มีรหัส ต้องเป็น null (ไม่ใช่ '')
const dbName = 'expense_app';

/* ===== Helpers ===== */
String _prompt(String label) {
  stdout.write('$label: ');
  return stdin.readLineSync()?.trim() ?? '';
}

String _promptHidden(String label) {
  stdout.write('$label: ');
  try { stdin.echoMode = false; } catch (_) {}
  final s = stdin.readLineSync() ?? '';
  try { stdin.echoMode = true; } catch (_) {}
  stdout.writeln();
  return s.trim();
}

String _fmtDate(dynamic d) {
  if (d is DateTime) {
    return d.toIso8601String().replaceFirst('T',' ').substring(0,19);
  }
  return d?.toString() ?? '';
}

/* ===== Main ===== */
Future<void> main() async {
  MySqlConnection conn;
  try {
    conn = await MySqlConnection.connect(ConnectionSettings(
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPass,   // ส่งเป็น null = ไม่ใช้รหัส
      db: dbName,
    ));
  } catch (e) {
    stderr.writeln('❌ Connect MySQL failed: $e');
    stderr.writeln('• เช็คว่า MySQL(XAMPP) เป็น Running');
    stderr.writeln('• เช็คพอร์ต (dbPort=$dbPort) ให้ตรงกับ XAMPP');
    return;
  }

  stdout.writeln('===== Login =====');
  final username = _prompt('Username');
  final password = _prompt('Password');

  // LOGIN แบบ plain (ตรงกับ db.sql)
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

  while (true) {
    stdout.writeln('''
======== Expense Tracking App ========
Welcome $username
1) Show all
2) Show today
3) Search
4) Add expense
5) Delete by id
6) Exit
''');
    switch (_prompt('Choose')) {
      case '1': await showAll(conn, userId); break;
      case '2': await showToday(conn, userId); break;
      case '3': await searchExpense(conn, userId); break;
      case '4': await addExpense(conn, userId); break;
      case '5': await deleteById(conn, userId); break;
      case '6':
        stdout.writeln('Bye!');
        await conn.close();
        return;
      default:
        stdout.writeln('Invalid option.');
    }
  }
}

/* ===== Features ===== */
Future<void> showAll(MySqlConnection conn, int userId) async {
  final rows = await conn.query(
    'SELECT id, item, paid, date FROM expenses WHERE user_id=? ORDER BY date DESC',
    [userId],
  );
  if (rows.isEmpty) { stdout.writeln('No items.'); return; }
  int total = 0;
  stdout.writeln('--- All expenses ---');
  for (final r in rows) {
    final id = r[0]; final item = r[1]; final paid = r[2] as int; final date = _fmtDate(r[3]);
    total += paid; stdout.writeln('$id. $item  \$$paid  @ $date');
  }
  stdout.writeln('Total = \$$total');
}

Future<void> showToday(MySqlConnection conn, int userId) async {
  final rows = await conn.query(
    'SELECT id, item, paid, date FROM expenses WHERE user_id=? AND DATE(date)=CURDATE() ORDER BY date DESC',
    [userId],
  );
  if (rows.isEmpty) { stdout.writeln('No items paid today.'); return; }
  int total = 0;
  stdout.writeln('--- Paid today ---');
  for (final r in rows) {
    final id = r[0]; final item = r[1]; final paid = r[2] as int; final date = _fmtDate(r[3]);
    total += paid; stdout.writeln('$id. $item  \$$paid  @ $date');
  }
  stdout.writeln("Today's total = \$$total");
}

Future<void> searchExpense(MySqlConnection conn, int userId) async {
  final kw = _prompt('Search keyword');
  final rows = await conn.query(
    'SELECT id, item, paid, date FROM expenses WHERE user_id=? AND item LIKE ? ORDER BY date DESC',
    [userId, '%$kw%'],
  );
  if (rows.isEmpty) { stdout.writeln('No item containing "$kw".'); return; }
  int total = 0;
  stdout.writeln('--- Search result "$kw" ---');
  for (final r in rows) {
    final id = r[0]; final item = r[1]; final paid = r[2] as int; final date = _fmtDate(r[3]);
    total += paid; stdout.writeln('$id. $item  \$$paid  @ $date');
  }
  stdout.writeln('Total = \$$total');
}

Future<void> addExpense(MySqlConnection conn, int userId) async {
  final item = _prompt('Title');
  final amountStr = _prompt('Amount (number)');
  final amount = int.tryParse(amountStr);
  if (item.isEmpty || amount == null || amount < 0) {
    stdout.writeln('Invalid input.'); return;
  }
  await conn.query(
    'INSERT INTO expenses (user_id, item, paid, date) VALUES (?, ?, ?, NOW())',
    [userId, item, amount],
  );
  stdout.writeln('Added!');
}

Future<void> deleteById(MySqlConnection conn, int userId) async {
  final idStr = _prompt('Enter expense id to delete');
  final id = int.tryParse(idStr);
  if (id == null) { stdout.writeln('Invalid id.'); return; }
  final res = await conn.query(
    'DELETE FROM expenses WHERE id=? AND user_id=?',
    [id, userId],
  );
  stdout.writeln(res.affectedRows == 0 ? 'Nothing deleted.' : 'Deleted #$id.');
}





