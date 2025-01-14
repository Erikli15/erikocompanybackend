<?php

// Use necessary Google services for BigLake and Sheets
use Google\Service\BigLakeService\Database;
error_reporting(E_ALL & ~E_DEPRECATED); // Disable deprecated warnings
require "vendor/autoload.php"; // Load the required libraries via Composer
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../'); // Load environment variables from a .env file
use Google\Client;
use Google\Service\Sheets;

// Create a Google client instance
$client = new Client();
$dotenv->load(); // Load environment variables from .env file

// Set up the HTTP client and other configurations for Google API client
$client->setHttpClient(new \GuzzleHttp\Client(["verify" => false])); // Disable SSL verification for development
$client->setApplicationName("Google Sheets API PHP"); // Set application name
$client->setScopes([Sheets::SPREADSHEETS]); // Set the scope to work with Google Sheets
$client->setAuthConfig($_ENV["GOOGLE_AUTH_CONFIG"]); // Load the authentication configuration from environment variables
$client->setConfig("debug", true); // Enable debug mode for the client

$spreadsheetId = $_ENV["SPREADSHEET_ID"]; // Get the spreadsheet ID from environment variables
$service = new Sheets($client); // Create an instance of Google Sheets API service

// Define the column names to be added in the sheet (ID, productName, etc.)
$columnNames = [["id", "productName", "price", "category", "descriptions", "stockStatus", "imgUrl"]];

// Define the range to update column headers (from cell A1 to G1)
$headerRange = $_ENV["RANGE"] . "!A1:G1";

// Create a new ValueRange instance with the column names
$headerBody = new \Google\Service\Sheets\ValueRange(["values" => $columnNames]);

// Define the parameters for the update (value input as RAW, no formatting)
$headerParams = ["valueInputOption" => "RAW"];

try {
    // Attempt to update the header row in the spreadsheet
    $headerResult = $service->spreadsheets_values->update($spreadsheetId, $headerRange, $headerBody, $headerParams);
    echo "{$headerResult->getUpdatedCells()} cells updated with columnnames"; // Print success message
} catch (Exception $e) {
    echo "Wrong with columnnames: " . $e->getMessage() . "\n"; // Print error message if update fails
}

// Function to retrieve data from the Google Sheet
function getDataFromGoogleSheet($spreadsheetId, $service)
{
    $range = $_ENV["RANGE"]; // Get the range from environment variables
    $respones = $service->spreadsheets_values->get($spreadsheetId, $range); // Get the values from the sheet
    $values = $respones->getValues(); // Extract values from the response
    return $values; // Return the values
}

// Include the external file "products.php" to interact with the database
require_once "products.php";
$database = new Databas(); // Create an instance of the database service

// Assume $insertedId is an array of product IDs retrieved from the database
$insertedId = $database->getProductIds();

// Transform the product IDs into a two-dimensional array for insertion
$valuesToInsert = [];
foreach ($insertedId as $id) {
    $valuesToInsert[] = [$id]; // Each ID gets its own row
}

// Define the range in the sheet where product IDs should be inserted (starting from A2)
$insertRange = $_ENV["RANGE"] . "!A2:A";

// Create a ValueRange instance for the data to be inserted
$insertBody = new \Google\Service\Sheets\ValueRange(["values" => $valuesToInsert]);

// Set parameters for the insert (value input as RAW)
$insertParams = ["valueInputOption" => "RAW"];

try {
    // Attempt to insert product IDs into the Google Sheet
    $insertResult = $service->spreadsheets_values->update($spreadsheetId, $insertRange, $insertBody, $insertParams);
    echo "{$insertResult->getUpdatedCells()} cells updated with product IDs"; // Print success message
} catch (Exception $e) {
    echo "Something went wrong with inserting product IDs: " . $e->getMessage() . "\n"; // Print error message if insertion fails
}

// Check if $productName is defined (assuming it is a product name passed somewhere in the code)
if (isset($productName)) {
    // Call a method to decrease the stock status for the product in the database
    $updateStockStatus = $database->decreaseStockStatus($productName);

    // If the stock was decreased, update the Google Sheet
    if ($updateStockStatus) {
        // Retrieve the current stock status (adjust if needed based on your database structure)
        $currentStockStatus = $database->decreaseStockStatus($productName); // You may need to adjust this logic

        // Calculate the new stock status (e.g., subtract 1 from the current stock)
        $newStockStatus = $currentStockStatus - 1;

        // Define the range in the sheet where the stock status should be updated (e.g., column F, starting from row 2)
        $updateRange = $_ENV["RANGE"] . "!F2:F"; // Adjust as needed

        // Create a ValueRange instance for the updated stock status
        $updateBody = new \Google\Service\Sheets\ValueRange(["values" => [[$newStockStatus]]]);

        // Set parameters for the update (value input as RAW)
        $updateParams = ["valueInputOption" => "RAW"];

        try {
            // Attempt to update the stock status in the Google Sheet
            $updateResult = $service->spreadsheets_values->update($spreadsheetId, $updateRange, $updateBody, $updateParams);
            echo "{$updateResult->getUpdatedCells()} cells updated with new stock status for $productName"; // Print success message
        } catch (Exception $e) {
            echo "Something went wrong with updating stock status: " . $e->getMessage() . "\n"; // Print error message if update fails
        }
    } else {
        echo "Stock status could not be decreased for $productName.\n"; // Print error message if stock status could not be decreased
    }
} else {
    echo "Product name is not defined.\n"; // Print error message if $productName is not defined
}

?>