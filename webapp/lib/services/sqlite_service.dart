import 'package:sqflite/sqflite.dart';
import 'package:csv/csv.dart';
import 'dart:io';
import 'package:path/path.dart';

class SQLiteService {
  static Future<Database> initDatabase() async {
    final dbPath = await getDatabasesPath();
    return openDatabase(
      join(dbPath, "data.db"),
      onCreate: (db, version) async {
        await db.execute("""
          CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            round TEXT,
            team1 TEXT,
            team2 TEXT
          )
        """);
      },
      version: 1,
    );
  }

  static Future<void> convertCSVToSQLite(File csvFile) async {
    final db = await initDatabase();

    // Read CSV file
    final csvString = await csvFile.readAsString();
    List<List<dynamic>> csvData = const CsvToListConverter().convert(csvString);

    // Insert CSV data into SQLite
    for (var row in csvData.skip(1)) {
      await db.insert(
        "matches",
        {"round": row[0], "team1": row[1], "team2": row[2]},
      );
    }

    print("CSV data inserted into SQLite.");
  }

  static Future<List<Map<String, dynamic>>> queryMatches(String round) async {
    final db = await initDatabase();
    return await db.query(
      "matches",
      where: "round = ?",
      whereArgs: [round],
    );
  }
}
