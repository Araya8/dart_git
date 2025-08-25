// bin/dart_git.dart
// Dart CLI เชื่อมต่อ MySQL + เมนู 1–6
import 'dart:io';
import 'package:mysql1/mysql1.dart';

Future<void> main() async {
  /* ---------- MySQL Connection Settings ---------- */
  final settings = ConnectionSettings(
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    db: 'expense_app',
  );

  final conn = await MySqlConnection.connect(settings);

  /* ---------- Login ---------- */
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

  /* ---------- Main Menu Loop ---------- */
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
// TODO: ให้เพื่อน ๆ แต่ละคนมาเติมโค้ดข้างในเอง

/* ================= Features  showall================= */
Future<void> showAll(MySqlConnection conn, int userId) async {
  
}

/* ================= Features showtoday ================= */
Future<void> showToday(MySqlConnection conn, int userId) async {

}

/* ================= Features searchExpense================= */
Future<void> searchExpense(MySqlConnection conn, int userId) async {
  final keyword = _prompt('Search keyword');
  final results = await conn.query(
    'SELECT id, title, amount, date FROM expenses WHERE user_id = ? AND title LIKE ?',
    [userId, '%$keyword%'],
  );

  if (results.isEmpty) {
    stdout.writeln('No expenses found matching "$keyword".');
    return;
  }

  stdout.writeln('Search Results:');
  for (final row in results) {
    stdout.writeln('ID: ${row[0]}, Title: ${row[1]}, Amount: ${row[2]}, Date: ${row[3]}');
  }
}

/* ================= Features addExpense================= */
Future<void> addExpense(MySqlConnection conn, int userId) async {

}

/* ================= Features deleteById================= */
Future<void> deleteById(MySqlConnection conn, int userId) async {

}


/* ================= Helpers ================= */
String _prompt(String label) {
  stdout.write('$label: ');
  return stdin.readLineSync()!.trim();
}

String _promptHidden(String label) {
  stdout.write('$label: ');
  try { stdin.echoMode = false; } catch (_) {}
  final s = stdin.readLineSync()!.trim();
  try { stdin.echoMode = true; } catch (_) {}
  stdout.writeln();
  return s;
}
