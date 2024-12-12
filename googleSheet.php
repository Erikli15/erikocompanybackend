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

try {
    $service = new Sheets($client);
    $spreadsheet = $service->spreadsheets->get($spreadsheetId);

    // Logga hela API-svaret
    echo 'Full API response: ' . print_r($spreadsheet, true) . "\n";

    $sheets = $spreadsheet->getSheets();
    if (is_null($sheets)) {
        echo 'Inga ark hittades i kalkylbladet.' . "\n";
    } elseif (is_array($sheets) || $sheets instanceof Countable) {
        foreach ($sheets as $sheet) {
            $title = $sheet->getProperties()->getTitle();
            echo 'Ark titel: ' . $title . "\n";

            // Hämta värden från arket
            $range = $title; // eller specificera ett intervall, t.ex. 'Sheet1!A1:C10'
            $response = $service->spreadsheets_values->get($spreadsheetId, $range);
            $values = $response->getValues();

            if (empty($values)) {
                echo "Inga värden hittades i arket '$title'.\n";
            } else {
                echo "Värden i arket '$title':\n";
                foreach ($values as $row) {
                    echo implode(", ", $row) . "\n"; // Skriv ut varje rad
                }
            }
        }
    } else {
        echo 'Oväntad datatyp för ark.' . "\n";
    }
} catch (Exception $e) {
    echo 'Fel vid hämtning av kalkylblad: ' . $e->getMessage() . "\n";
    echo 'Spår: ' . $e->getTraceAsString() . "\n";
}

// Definiera data som ska läggas till
$values = [
    ["Erik", 30], // Ny rad
    ["Anna", 25]  // Ny rad
];

// Definiera intervallet där data ska läggas till
$range = $_ENV['RANGE']; // Ändra 'Sheet1' till namnet på ditt ark

// Skapa en värdestruktur
$body = new \Google\Service\Sheets\ValueRange([
    'values' => $values
]);

// Ange hur data ska läggas till
$params = [
    'valueInputOption' => 'RAW' // eller 'USER_ENTERED'
];

try {
    // Använd append-metoden för att lägga till data
    $result = $service->spreadsheets_values->append($spreadsheetId, $range, $body, $params);
    echo "{$result->getUpdates()->getUpdatedCells()} celler lades till.\n";
} catch (Exception $e) {
    echo 'Fel vid tillägg av data till kalkylblad: ' . $e->getMessage() . "\n";
}

?>