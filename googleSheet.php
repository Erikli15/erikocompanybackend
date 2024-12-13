<?php
require 'vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
use Google\Client;
use Google\Service\Sheets;

$client = new Client();
$client->setHttpClient(new \GuzzleHttp\Client(['verify' => false]));

$client->setApplicationName('Google Sheets API PHP');
$client->setScopes([Sheets::SPREADSHEETS]);
$client->setAuthConfig($_ENV['GOOGLE_AUTH_CONFIG']);
$client->setConfig('debug', true);

$spreadsheetId = $_ENV['SPREADSHEET_ID'];
$service = new Sheets($client);

$columnNames = [["id", "productName", "price", "category", "descriptions", "stockStatus"]];

$headerRange = $_ENV['RANGE'] . '!A1:F1';

$headerBody = new \Google\Service\Sheets\ValueRange(['values' => $columnNames]);

$headerParams = ['valueInputOption' => 'RAW'];

try {
    $headerResult = $service->spreadsheets_values->update($spreadsheetId, $headerRange, $headerBody, $headerParams);
    echo "{$headerResult->getUpdatedCells()} cells updated with columnnames";
} catch (Exception $e) {
    echo "Wrong with columnnames: " . $e->getMessage() . "\n";
}


function getDataFromGoogleSheet($spreadsheetId, $service)
{
    $range = $_ENV['RANGE'];
    $respones = $service->spreadsheets_values->get($spreadsheetId, $range);
    $values = $respones->getValues();
    return $values;
}

// Anropa funktionen för att hämta data från Google Sheets


// Definiera data som ska lggas till
// $values = [
//     ["Erik", 30], // Ny rad
//     ["Anna", 25]  // Ny rad
// ];

// // Definiera intervallet där data ska läggas till
// $range = $_ENV['RANGE']; // Ändra 'Sheet1' till namnet på ditt ark

// // Skapa en värdestruktur
// $body = new \Google\Service\Sheets\ValueRange([
//     'values' => $values
// ]);

// // Ange hur data ska läggas till
// $params = [
//     'valueInputOption' => 'RAW' // eller 'USER_ENTERED'
// ];

// try {
//     // Använd append-metoden för att lägga till data
//     $result = $service->spreadsheets_values->append($spreadsheetId, $range, $body, $params);
//     echo "{$result->getUpdates()->getUpdatedCells()} celler lades till.\n";
// } catch (Exception $e) {
//     echo 'Fel vid tillägg av data till kalkylblad: ' . $e->getMessage() . "\n";
// }

?>