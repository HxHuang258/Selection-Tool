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
          ],
        ),
      ),
    );
  }
}
