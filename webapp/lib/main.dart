import 'dart:io';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:webapp/screens/sign_in_screen.dart';
import 'firebase_options.dart'; // Import the generated Firebase options file
import 'services/firebase_csv_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase with the options for the platform
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,  // Automatically generated options
  );

  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Firebase Sign-In',
      home: SignInScreen(),
    );
  }
}
