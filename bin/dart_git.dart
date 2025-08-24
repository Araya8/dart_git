// bin/dart_git.dart
// Dart CLI เชื่อมต่อ MySQL + เมนู 1–6 (ใช้ users.password เป็นค่า plain)
import 'dart:io';
import 'package:mysql1/mysql1.dart';

Future<void> main() async {
  final settings = ConnectionSettings(
    host: '127.0.0.1', // หรือ 'localhost'
    port: 3306,
    user: 'root',      // แก้ให้ตรงเครื่องคุณ
    password: '',      // ใส่ถ้ามี
    db: 'expense_app', // สร้างจาก phpMyAdmin แล้ว
  );

  final conn = await MySqlConnection.connect(settings);

  // ---- Login (เทียบ password แบบ plain) ----
  stdout.writeln('== Login ==');
  final username = _prompt('Username');
  final password = _promptHidden('Password');

  final auth = await conn.query(
    'SELECT id FROM users WHERE username=? AND password=? LIMIT 1',
    [username, password],
  );

  if (auth.isEmpty) {
    stdout.writeln('Login failed. Bye!');
    await conn.close();
    return;
  }
  final userId = auth.first[0] as int;
  stdout.writeln('Login success!');

  // ---- Main Menu ----
  while (true) {
    stdout.writeln('''
1) Show all
2) Show today
3) Search
4) Add expense
5) Delete by id
6) Exit
''');
    switch (_prompt('Choose')) {
      case '1':
        await showAll(conn, userId);
        break;
      case '2':
        await showToday(conn, userId);
        break;
      case '3':
        await searchExpense(conn, userId);
        break;
      case '4':
        await addExpense(conn, userId);
        break;
      case '5':
        await deleteById(conn, userId);
        break;
      case '6':
        stdout.writeln('Bye!');
        await conn.close();
        return;
      default:
        stdout.writeln('Invalid option.');
    }
  }
}

/* ================= Features ================= */

Future<void> showAll(MySqlConnection conn, int userId) async {
  final rows = await conn.query(
    'SELECT id, item, paid, date FROM expenses WHERE user_id=? ORDER BY date DESC',
    [userId],
  );
  if (rows.isEmpty) {
    stdout.writeln('No items.');
    return;
  }
  stdout.writeln('--- All expenses ---');
  for (final r in rows) {
    stdout.writeln('${r[0]}. ${r[1]}  \$${r[2]}  @ ${r[3]}');
  }
}

Future<void> showToday(MySqlConnection conn, int userId) async {
  final rows = await conn.query(
    "SELECT id, item, paid, date FROM expenses WHERE user_id=? AND DATE(date)=CURDATE() ORDER BY date DESC",
    [userId],
  );
  if (rows.isEmpty) {
    stdout.writeln('No items paid today.');
    return;
  }
  stdout.writeln('--- Paid today ---');
  for (final r in rows) {
    stdout.writeln('${r[0]}. ${r[1]}  \$${r[2]}  @ ${r[3]}');
  }
}

Future<void> searchExpense(MySqlConnection conn, int userId) async {
  final kw = _prompt('Search keyword');
  final rows = await conn.query(
    'SELECT id, item, paid, date FROM expenses WHERE user_id=? AND item LIKE ? ORDER BY date DESC',
    [userId, '%$kw%'],
  );
  if (rows.isEmpty) {
    stdout.writeln('No item containing "$kw".');
    return;
  }
  stdout.writeln('--- Search result ---');
  for (final r in rows) {
    stdout.writeln('${r[0]}. ${r[1]}  \$${r[2]}  @ ${r[3]}');
  }
}

Future<void> addExpense(MySqlConnection conn, int userId) async {
  final item = _prompt('Title');
  final amountStr = _prompt('Amount (number)');
  final amount = int.tryParse(amountStr);
  if (amount == null || amount < 0) {
    stdout.writeln('Invalid amount.');
    return;
  }
  await conn.query(
    'INSERT INTO expenses (user_id, item, paid, date) VALUES (?, ?, ?, NOW())',
    [userId, item, amount],
  );
  stdout.writeln('Added. Press 1 to check.');
}

Future<void> deleteById(MySqlConnection conn, int userId) async {
  final idStr = _prompt('Enter expense id to delete');
  final id = int.tryParse(idStr);
  if (id == null) {
    stdout.writeln('Invalid id.');
    return;
  }
  final res = await conn.query(
    'DELETE FROM expenses WHERE id=? AND user_id=?',
    [id, userId],
  );
  stdout.writeln(res.affectedRows == 0 ? 'Nothing deleted.' : 'Deleted #$id.');
}

/* ================= Helpers ================= */

String _prompt(String label) {
  stdout.write('$label: ');
  return stdin.readLineSync()!.trim();
}

String _promptHidden(String label) {
  stdout.write('$label: ');
  // กัน error บาง terminal (Windows)
  try { stdin.echoMode = false; } catch (_) {}
  final s = stdin.readLineSync()!.trim();
  try { stdin.echoMode = true; } catch (_) {}
  stdout.writeln();
  return s;
}
