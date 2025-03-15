import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../services/firebase_csv_service.dart';  // Import the FirebaseCSVService

class SignInScreen extends StatefulWidget {
  @override
  _SignInScreenState createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  String _statusMessage = "";
  bool _isLoading = false;

  // Firebase Auth instance
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // Sign in method
  Future<void> _signInWithEmailPassword() async {
    setState(() {
      _isLoading = true;  // Show loading spinner while signing in
    });

    try {
      // Sign in with email and password
      UserCredential userCredential = await _auth.signInWithEmailAndPassword(
        email: _emailController.text,
        password: _passwordController.text,
      );

      setState(() {
        _statusMessage = "User signed in: ${userCredential.user?.email}";
      });

      // After successful sign-in, trigger the CSV download
      await _downloadCSV();

    } catch (e) {
      setState(() {
        _statusMessage = "Error during sign-in: $e";
      });
    } finally {
      setState(() {
        _isLoading = false;  // Hide loading spinner
      });
    }
  }

  // Method to download CSV file
  Future<void> _downloadCSV() async {
    try {
      // Trigger CSV download using FirebaseCSVService
      await FirebaseCSVService.downloadCSV();
      setState(() {
        _statusMessage = "CSV download started!";
      });
    } catch (e) {
      setState(() {
        _statusMessage = "Failed to download CSV: $e";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Sign In")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _emailController,
              decoration: InputDecoration(labelText: "Email"),
            ),
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: InputDecoration(labelText: "Password"),
            ),
            SizedBox(height: 20),
            _isLoading
                ? CircularProgressIndicator()  // Show loading spinner during sign-in
                : ElevatedButton(
                    onPressed: _signInWithEmailPassword,
                    child: Text("Sign In"),
                  ),
            SizedBox(height: 20),
            Text(_statusMessage),  // Display status message (success or error)
          ],
        ),
      ),
    );
  }
}
