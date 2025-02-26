import 'package:sqflite/sqflite.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import 'package:path/path.dart';

class DatabaseHelper {
  static Database? _database;

  // Create or open the database
  Future<Database> get database async {
    if (_database != null) return _database!;

    // If the database doesn't exist, create one
    _database = await _initDatabase();
    return _database!;
  }

  // Initialize the database
  Future<Database> _initDatabase() async {
    // Get the app's document directory to store the database file
    var directory = await getApplicationDocumentsDirectory();
    String path = join(directory.path, 'app_database.db'); // Set the file name

    // Open/create the database
    return await openDatabase(path, version: 1, onCreate: _onCreate);
  }

  // Create tables if they don't exist
  Future _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER
      )
    ''');
  }

  // Insert data into the database
  Future<int> insertUser(Map<String, dynamic> user) async {
    Database db = await database;
    return await db.insert('users', user);
  }

  // Get data from the database
  Future<List<Map<String, dynamic>>> getUsers() async {
    Database db = await database;
    return await db.query('users');
  }

  // Update data
  Future<int> updateUser(Map<String, dynamic> user) async {
    Database db = await database;
    return await db.update('users', user, where: 'id = ?', whereArgs: [user['id']]);
  }

  // Delete data
  Future<int> deleteUser(int id) async {
    Database db = await database;
    return await db.delete('users', where: 'id = ?', whereArgs: [id]);
  }
}
