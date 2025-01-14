<?php
error_reporting(E_ALL & ~E_DEPRECATED);
// Include the file containing the getDataFromGoogleSheet function
require_once "googleSheet.php";
require "vendor/autoload.php";
// Load environment variables from .env file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../'); // Adjust the path as necessary
$dotenv->load();

// Create a new instance of the Databas class
$database = new Databas();

// Insert products into the database from Google Sheets
$database->insertProductsIntoDatabase($spreadsheetId, $service, $database);
// Update products in the database from Google Sheets
$database->updateProductsFromGoogleSheet($spreadsheetId, $service);

class Databas
{

    public $pdo;

    function __construct()
    {
        // Initialize database connection using environment variables
        $username = $_ENV["DB_USERNAME"];
        $password = $_ENV["DB_PASSWORD"];
        $host = $_ENV["DB_SERVERNAME"];
        $dbname = $_ENV["DB_DBNAME"];
        $dsn = "mysql:host=$host;dbname=$dbname";
        $this->pdo = new PDO($dsn, $username, $password);
        // Ensure the 'products' table exists in the database
        $this->ifTabletNotExist();
    }

    function ifTabletNotExist()
    {
        // This ensures the products table is created only once
        static $initialized = false;
        if ($initialized)
            return;

        // SQL query to create the products table if it does not exist
        $sql = "CREATE TABLE IF NOT EXISTS `products` (
                    `id` INT AUTO_INCREMENT NOT NULL,
                    `productName` varchar(200) NOT NULL,
                    `price` INT,
                    `category` varchar(100),
                    `descriptions` varchar(1000),
                    `stockStatus` INT,
                    `imgUrl` varchar(1000),
                    `views` INT DEFAULT 0,   
                    PRIMARY KEY (`id`)
                    ) ";

        // Execute the SQL query to create the table
        $this->pdo->exec($sql);
        $initialized = true;
    }

    function insertProductsIntoDatabase($spreadsheetId, $service, $database)
    {
        // Fetch data from Google Sheets
        $values = getDataFromGoogleSheet($spreadsheetId, $service);

        // Prepare SQL statement for inserting products
        $sqlInsert = "INSERT INTO products (productName, price, category, descriptions, stockStatus, imgUrl) VALUES (?,?,?,?,?,?)";
        $stmtInsert = $database->pdo->prepare($sqlInsert);

        // Prepare SQL statement to check if a product already exists
        $sqlSelect = "SELECT COUNT(*) FROM products WHERE productName = ?";
        $stmtSelect = $database->pdo->prepare($sqlSelect);

        // Loop through each row of data from Google Sheets
        foreach ($values as $index => $row) {
            if ($index === 0)
                continue; // Skip the first row (header)

            // Check if the row has enough columns
            if (count($row) >= 7) {
                // Check if the product already exists in the database
                $stmtSelect->execute([$row[1]]);
                $exists = $stmtSelect->fetchColumn();

                // If the product does not exist, insert it
                if ($exists == 0) {
                    // Insert product into the database
                    $stmtInsert->execute([$row[1], (float) $row[2], $row[4], $row[4], $row[5], $row[6]]); // Convert price to float
                }
            }
        }
    }

    function updateProductsFromGoogleSheet($spreadsheetId, $service)
    {
        // Fetch data from Google Sheets
        $values = getDataFromGoogleSheet($spreadsheetId, $service);

        // Iterate through each row of data, starting at index 1 to skip the header row
        foreach ($values as $index => $row) {
            if ($index === 0)
                continue; // Skip the first row (header)

            // Check if the row has enough columns
            if (count($row) >= 7) {
                // Extract product details from the row
                $productId = (int) $row[0];        // ID from the first column
                $productName = $row[1];           // Product name from the second column
                $price = (float) $row[2];          // Price from the third column
                $category = $row[3];              // Category from the fourth column
                $descriptions = $row[4];          // Description from the fifth column
                $stockStatus = (int) $row[5];      // Stock status from the sixth column
                $imgUrl = $row[6];                // Image URL from the seventh column

                // Call updateProduct to update the product in the database
                $isUpdated = $this->updateProduct(
                    $spreadsheetId,   // Spreadsheet ID (if needed for Google Sheets)
                    $service,         // Service (if needed for Google Sheets)
                    $this,            // Database instance
                    $productId,       // Product ID
                    $productName,     // Product name
                    $price,           // Product price
                    $category,        // Product category
                    $descriptions,    // Product description
                    $stockStatus,     // Product stock status
                    $imgUrl           // Product image URL
                );

                // Output success or failure message for each product update
                if ($isUpdated) {
                    echo "Product $productId was successfully updated.\n";
                } else {
                    echo "Product $productId could not be updated.\n";
                }
            }
        }
    }

    function updateProduct($spreadsheetId, $service, $database, $productId, $productName, $price, $category, $descriptions, $stockStatus, $imgUrl)
    {
        echo "Product $productId: $productName, $price, $category, $descriptions, $stockStatus, $imgUrl\n";

        // Prepare SQL statement to update the product
        $sqlUpdate = "UPDATE products SET productName = ?, price = ?, category = ?, descriptions = ?, stockStatus = ?, imgUrl = ? WHERE id = ?";
        $stmtUpdate = $this->pdo->prepare($sqlUpdate);

        // Execute the update query
        $stmtUpdate->execute([$productName, $price, $category, $descriptions, $stockStatus, $imgUrl, $productId]);

        // Check if any rows were affected (i.e., the product was updated)
        if ($stmtUpdate->rowCount() > 1) {
            return true; // Product was updated successfully
        } else {
            return false; // No changes, either the product doesn't exist or no changes were made
        }
    }

    function getProductIds()
    {
        // SQL query to fetch all product IDs
        $sql = "SELECT id FROM products";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();

        // Return all IDs as an array
        $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
        return $ids;
    }

    function decreaseStockStatus($productName)
    {
        // SQL query to decrease the stock status of a product, ensuring it doesn't go below 0
        $sqlUpdate = "UPDATE products SET stockStatus = stockStatus - 1 WHERE productName = ? AND stockStatus > 0";
        $stmtUpdate = $this->pdo->prepare($sqlUpdate);

        // Execute the update query
        $stmtUpdate->execute([$productName]);

        // Check if any rows were affected (i.e., stock was decreased)
        if ($stmtUpdate->rowCount() > 1) {
            return true; // Stock was successfully decreased
        } else {
            return false; // No changes, either the product doesn't exist or stock is already 0
        }
    }

    function getMostViewedProducts($limit = 5)
    {
        // SQL-fråga för att hämta de mest visade produkterna
        $sql = "SELECT * FROM products ORDER BY views DESC LIMIT ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$limit]);

        // Hämta alla produkter som har de högsta visningarna
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

// Check if the form was submitted with a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['insertProducts'])) {
        // Run insertProductsIntoDatabase
        $database->insertProductsIntoDatabase($spreadsheetId, $service, $database);
        echo "Products have been inserted into the database.";
    } elseif (isset($_POST['updateProducts'])) {
        // Run updateProductsFromGoogleSheet
        $database->updateProductsFromGoogleSheet($spreadsheetId, $service);
        echo "Products have been updated in the database.";
    } elseif (isset($_POST['decreaseStock'])) {
        // Run decreaseStockStatus
        $productName = $_POST['productName'];
        if ($database->decreaseStockStatus($productName)) {
            echo "Stock status for '$productName' has been decreased.";
        } else {
            echo "Could not decrease stock status for '$productName'.";
        }
    }
}

// Check if the request is a GET request and 'mostViewed' is set
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['mostViewed'])) {
    // Anropa funktionen för att hämta de mest visade produkterna
    $mostViewedProducts = $database->getMostViewedProducts(5); // Hämtar de 5 mest visade produkterna

    // Returnera dessa produkter som JSON
    echo json_encode($mostViewedProducts);
}
?>