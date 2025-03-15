import 'package:flutter/material.dart';
import '../services/sqlite_service.dart';

class SearchScreen extends StatefulWidget {
  @override
  _SearchScreenState createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  String selectedRound = "Round 1";
  List<Map<String, dynamic>> matches = [];

  void _searchMatches() async {
    List<Map<String, dynamic>> results = await SQLiteService.queryMatches(selectedRound);
    setState(() {
      matches = results;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Search Matches")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            DropdownButton<String>(
              value: selectedRound,
              items: ["Round 1", "Round 2", "Round 3"].map((String round) {
                return DropdownMenuItem(
                  value: round,
                  child: Text(round),
                );
              }).toList(),
              onChanged: (String? newValue) {
                setState(() {
                  selectedRound = newValue!;
                });
              },
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: _searchMatches,
              child: Text("Search Matches"),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: matches.length,
                itemBuilder: (context, index) {
                  return ListTile(
                    title: Text("${matches[index]['team1']} vs ${matches[index]['team2']}"),
                    subtitle: Text("Round: ${matches[index]['round']}"),
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
