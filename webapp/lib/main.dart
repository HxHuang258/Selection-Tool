import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'services/firebase_csv_service.dart';
import 'services/sqlite_service.dart';
import 'screens/search_screen.dart';
import 'dart:io';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  // Download and convert CSV on startup
  File csvFile = await FirebaseCSVService.downloadCSV();
  await SQLiteService.convertCSVToSQLite(csvFile);

  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Match Search',
      home: SearchScreen(),
    );
  }
}
