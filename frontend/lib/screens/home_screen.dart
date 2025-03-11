import 'package:flutter/material.dart';
import '../services/api_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _message = 'Fetching data...';
  List<dynamic> _tournaments = [];

  // Default gender selection
  String selectedGender = "M"; // Default value (M)

  TextEditingController _controller = TextEditingController();

  String _userInput = ''; // Variable to store the user input

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  // Call the test query API
  Future<void> _fetchData() async {
    try {
      final response = await ApiService.fetchTestQuery();
      setState(() {
        _message = response['message'];
        _tournaments = response['data'];
      });
    } catch (e) {
      setState(() {
        _message = 'Error: $e';
      });
    }
  }

  Future<void> _fetchGenderData(String gender) async {
    try {
      final response = await ApiService.fetchGenderQuery(selectedGender);
      setState(() {
        _message = response['message'];
        _tournaments = response['data'];
      });
    } catch (e) {
      setState(() {
        _message = 'Error: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Test Query Example'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Message: $_message'),
            Text('Response: $_tournaments'),
            // DropdownButton to select gender (M/F)
            Text("Select Gender:", style: TextStyle(fontSize: 16)),
            DropdownButton<String>(
              value: selectedGender,
              items: <String>["M", "F"]
                  .map((String gender) {
                    return DropdownMenuItem<String>(
                      value: gender,
                      child: Text(gender == "M" ? "Male" : "Female"),
                    );
                  }).toList(),
              onChanged: (String? newValue) {
                setState(() {
                  selectedGender = newValue!;
                });
              },
            ),
            SizedBox(height: 20),
            // Button to trigger the search
            ElevatedButton(
              onPressed: () {
                _fetchGenderData(selectedGender);
              },
              child: Text("Search Matches"),
            ),
          ],
        ),
      ),
    );
  }
}
