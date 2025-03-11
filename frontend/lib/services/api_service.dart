import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://localhost:3000';  // Use the correct URL

  static Future<Map<String, dynamic>> fetchTestQuery() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/test-query'));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to fetch data. Status Code: ${response.statusCode}');
      }
    } catch (e) {
      print("Error fetching data: $e");
      throw Exception('Failed to fetch data');
    }
  }

  static Future<Map<String, dynamic>> fetchGenderQuery(String gender) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/search-matches?gender=$gender'));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to fetch data. Status Code: ${response.statusCode}');
      }
    } catch (e) {
      print("Error fetching data: $e");
      throw Exception('Failed to fetch data');
    }
  }
}
