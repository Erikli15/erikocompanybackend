<?php

use Google\Service\BigLakeService\Database;
error_reporting(E_ALL & ~E_DEPRECATED);
require "vendor/autoload.php";
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../'); // Adjust the path as necessary
use Google\Client;
use Google\Service\Sheets;
$client = new Client();
$dotenv->load();

$client->setHttpClient(new \GuzzleHttp\Client(["verify" => false]));

$client->setApplicationName("Google Sheets API PHP");
$client->setScopes([Sheets::SPREADSHEETS]);
$client->setAuthConfig($_ENV["GOOGLE_AUTH_CONFIG"]);
$client->setConfig("debug", true);

$spreadsheetId = $_ENV["SPREADSHEET_ID"];
$service = new Sheets($client);


$columnNames = [["id", "productName", "price", "category", "descriptions", "stockStatus", "imgUrl"]];

$headerRange = $_ENV["RANGE"] . "!A1:G1";

$headerBody = new \Google\Service\Sheets\ValueRange(["values" => $columnNames]);

$headerParams = ["valueInputOption" => "RAW"];

try {
    $headerResult = $service->spreadsheets_values->update($spreadsheetId, $headerRange, $headerBody, $headerParams);
    echo "{$headerResult->getUpdatedCells()} cells updated with columnnames";
} catch (Exception $e) {
    echo "Wrong with columnnames: " . $e->getMessage() . "\n";
}
function getDataFromGoogleSheet($spreadsheetId, $service)
{
    $range = $_ENV["RANGE"];
    $respones = $service->spreadsheets_values->get($spreadsheetId, $range);
    $values = $respones->getValues();
    return $values;
}


require_once "products.php";
$database = new Databas();

// Anta att $insertedId är en array av produkt-ID:n
$insertedId = $database->getProductIds();

// Omvandla till en tvådimensionell array
$valuesToInsert = [];
foreach ($insertedId as $id) {
    $valuesToInsert[] = [$id]; // Varje ID i en egen rad
}

// Definiera området där du vill sätta in ID:n, t.ex. A2:A (kolumn A, rad 2 och neråt)
$insertRange = $_ENV["RANGE"] . "!A2:A";

// Skapa en ValueRange för att skicka data
$insertBody = new \Google\Service\Sheets\ValueRange(["values" => $valuesToInsert]);

// Parametrar för att sätta in värden
$insertParams = ["valueInputOption" => "RAW"];

try {
    // Uppdatera Google Sheets med ID:n
    $insertResult = $service->spreadsheets_values->update($spreadsheetId, $insertRange, $insertBody, $insertParams);
    echo "{$insertResult->getUpdatedCells()} cells updated with product IDs";
} catch (Exception $e) {
    echo "Something went wrong with inserting product IDs: " . $e->getMessage() . "\n";
}


// Kontrollera om $productName är definierad
if (isset($productName)) {
    // Anropa decreaseStockStatus och få svaret
    $updateStockStatus = $database->decreaseStockStatus($productName);

    // Om lagret minskades, uppdatera Google Sheets
    if ($updateStockStatus) {
        // Hämta det aktuella lagret (detta kan behöva justeras beroende på din databasstruktur)
        $currentStockStatus = $database->decreaseStockStatus($productName); // Du behöver implementera denna metod

        // Beräkna det nya lagret
        $newStockStatus = $currentStockStatus - 1;

        // Definiera området där du vill uppdatera lagret, t.ex. F2:F
        $updateRange = $_ENV["RANGE"] . "!F2:F"; // Justera om nödvändigt

        // Skapa en ValueRange för att skicka data
        $updateBody = new \Google\Service\Sheets\ValueRange(["values" => [[$newStockStatus]]]);

        // Parametrar för att sätta in värden
        $updateParams = ["valueInputOption" => "RAW"];

        try {
            // Uppdatera Google Sheets med det nya lagret
            $updateResult = $service->spreadsheets_values->update($spreadsheetId, $updateRange, $updateBody, $updateParams);
            echo "{$updateResult->getUpdatedCells()} cells updated with new stock status for $productName";
        } catch (Exception $e) {
            echo "Something went wrong with updating stock status: " . $e->getMessage() . "\n";
        }
    } else {
        echo "Stock status could not be decreased for $productName.\n";
    }
} else {
    echo "Product name is not defined.\n";
}

?>