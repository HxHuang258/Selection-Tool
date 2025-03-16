import 'package:firebase_storage/firebase_storage.dart';
import 'dart:html' as html;  // For Web
import 'package:http/http.dart' as http;

class FirebaseCSVService {
  // Method to download CSV for Web
  static Future<void> downloadCSV() async {
    try {
      // Reference to the CSV file in Firebase Storage
      final ref = FirebaseStorage.instance.ref().child("all_matches.sql");

      // Fetch the download URL using Firebase Storage SDK (not direct HTTP request)
      final url = await ref.getDownloadURL();

      // Create an anchor element to trigger the download
      final anchor = html.AnchorElement(href: url)
        ..target = 'blank'
        ..download = "match-archive.csv";  // The file will be saved as match-archive.csv
      anchor.click();  // Trigger the download

      print("✅ CSV download triggered successfully.");
    } catch (e) {
      print("❌ Error downloading CSV: $e");
      throw Exception("Failed to download CSV.");
    }
  }
}
