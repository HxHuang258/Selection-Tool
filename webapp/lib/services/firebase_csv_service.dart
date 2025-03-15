import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import 'package:http/http.dart' as http;

class FirebaseCSVService {
  static Future<File> downloadCSV() async {
    await Firebase.initializeApp(); // Ensure Firebase is initialized

    // Reference to the CSV file in Firebase Storage
    final ref = FirebaseStorage.instance.ref().child("files/data.csv");
    final url = await ref.getDownloadURL();

    // Get local storage directory
    final dir = await getApplicationDocumentsDirectory();
    final file = File("${dir.path}/data.csv");

    // Download CSV file
    final response = await http.get(Uri.parse(url));
    await file.writeAsBytes(response.bodyBytes);

    print("CSV downloaded to: ${file.path}");
    return file;
  }
}
