import 'package:flutter/material.dart';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dropdown Query Example',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: QueryPage(),
    );
  }
}

class QueryPage extends StatefulWidget {
  @override
  _QueryPageState createState() => _QueryPageState();
}

class _QueryPageState extends State<QueryPage> {
  Database? _database;
  List<Map<String, dynamic>> _queryResults = [];
  List<String> dropdownOptions = []; // Stores distinct values

  String? selected1, selected2, selected3, selected4, selected5;

  @override
  void initState() {
    super.initState();
    _initDatabase();
  }

  Future<void> _initDatabase() async {
  String path = join(await getDatabasesPath(), 'be-match-archive.db');
  _database = await openDatabase(path, version: 1);
  
  print("Database initialized at: $path");

  await _testDatabaseConnection(); // Test connection
}


  // Initialize Database & Fetch Dropdown Options
  Future<void> _testDatabaseConnection() async {
  if (_database == null) {
    print("Database is not initialized!");
    return;
  }

  try {
    List<Map<String, dynamic>> result = 
        await _database!.rawQuery("SELECT DISTINCT Tournament FROM 'all_matches'");

    print("Query result: $result");
  } catch (e) {
    print("Database query failed: $e");
  }
}


  // Fetch DISTINCT values from a column (e.g., "Tournament")
  Future<void> _fetchDistinctValues() async {
    if (_database == null) return;

    List<Map<String, dynamic>> results =
        await _database!.rawQuery("SELECT DISTINCT Tournament FROM 'all_matches'");

    setState(() {
      dropdownOptions = results.map((row) => row["Tournament"].toString()).toList();
    });
  }

  // Query based on dropdown selections
  Future<void> _runQuery() async {
    if (_database == null) return;

    List<String> conditions = [];
    List<dynamic> args = [];

    if (selected1 != null) {
      conditions.add("Tournament = ?");
      args.add(selected1);
    }
    if (selected2 != null) {
      conditions.add("Tournament = ?");
      args.add(selected2);
    }
    if (selected3 != null) {
      conditions.add("Tournament = ?");
      args.add(selected3);
    }
    if (selected4 != null) {
      conditions.add("Tournament = ?");
      args.add(selected4);
    }
    if (selected5 != null) {
      conditions.add("Tournament = ?");
      args.add(selected5);
    }

    String whereClause = conditions.isNotEmpty ? "WHERE " + conditions.join(" OR ") : "";

    String query = "SELECT * FROM matches $whereClause";
    List<Map<String, dynamic>> results = await _database!.rawQuery(query, args);

    setState(() {
      _queryResults = results;
    });
  }

  // Dropdown builder
  Widget _buildDropdown(String label, String? selectedValue, Function(String?) onChanged) {
    return DropdownButton<String>(
      value: selectedValue,
      hint: Text(label),
      items: dropdownOptions.map((value) {
        return DropdownMenuItem(value: value, child: Text(value));
      }).toList(),
      onChanged: onChanged,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Dynamic Dropdown Query")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            _buildDropdown("Select 1", selected1, (val) => setState(() => selected1 = val)),
            _buildDropdown("Select 2", selected2, (val) => setState(() => selected2 = val)),
            _buildDropdown("Select 3", selected3, (val) => setState(() => selected3 = val)),
            _buildDropdown("Select 4", selected4, (val) => setState(() => selected4 = val)),
            _buildDropdown("Select 5", selected5, (val) => setState(() => selected5 = val)),
            SizedBox(height: 20),
            ElevatedButton(onPressed: _runQuery, child: Text("Run Query")),
            Expanded(
              child: ListView.builder(
                itemCount: _queryResults.length,
                itemBuilder: (context, index) {
                  return ListTile(
                    title: Text(_queryResults[index].toString()),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
