<?php
require 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();


$apiKey = $_ENV['API_KEY'];
$spreadsheetId = $_ENV['SPREADSHEET_ID'];
$range = $_ENV['RANGE'];

$url = "https://sheets.googleapis.com/v4/spreadsheets/$spreadsheetId/values/$range?key=$apiKey";
$response = file_get_contents($url);
$data = json_decode($response, true);

// Visa värdena
if (!empty($data['values'])) {
    foreach ($data['values'] as $row) {
        echo implode(", ", $row) . "\n";
    }
}
