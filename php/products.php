<?php
error_reporting(E_ALL & ~E_DEPRECATED);
// Inkludera filen som innehåller getDataFromGoogleSheet-funktionen
require_once "googleSheet.php";
require "vendor/autoload.php";
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../'); // Adjust the path as necessary
$dotenv->load();

$database = new Databas();

$database->insertProductsIntoDatabase($spreadsheetId, $service, $database);
$database->updateProductsFromGoogleSheet($spreadsheetId, $service);

class Databas
{

    public $pdo;

    function __construct()
    {
        $username = $_ENV["DB_USERNAME"];
        $password = $_ENV["DB_PASSWORD"];
        $host = $_ENV["DB_SERVERNAME"];
        $dbname = $_ENV["DB_DBNAME"];
        $dsn = "mysql:host=$host;dbname=$dbname";
        $this->pdo = new PDO($dsn, $username, $password);
        $this->ifTabletNotExist();
    }

    function ifTabletNotExist()
    {
        static $initialized = false;
        if ($initialized)
            return;
        $sql = "CREATE TABLE IF NOT EXISTS `products` (
                    `id` INT AUTO_INCREMENT NOT NULL,
                    `productName` varchar(200) NOT NULL,
                    `price` INT,
                    `category` varchar(100),
                    `descriptions` varchar(1000),
                    `stockStatus` INT,
                    `imgUrl` varchar(1000),
                    PRIMARY KEY (`id`)
                    ) ";

        $this->pdo->exec($sql);
        $initialized = true;
    }
    function insertProductsIntoDatabase($spreadsheetId, $service, $database)
    {
        // Hämta data från Google Sheets
        $values = getDataFromGoogleSheet($spreadsheetId, $service);

        // Förbered SQL-satsen för att lägga till produkter
        $sqlInsert = "INSERT INTO products (productName, price, category, descriptions, stockStatus, imgUrl) VALUES (?,?,?,?,?,?)";
        $stmtInsert = $database->pdo->prepare($sqlInsert);

        // Förbered SQL-satsen för att kontrollera om produkten redan finns
        $sqlSelect = "SELECT COUNT(*) FROM products WHERE productName = ?";
        $stmtSelect = $database->pdo->prepare($sqlSelect);

        // Loop genom varje rad av data
        foreach ($values as $index => $row) {
            if ($index === 0)
                continue; // Hoppa över första raden (rubriker)

            // Kontrollera att raden har tillräckligt med kolumner
            if (count($row) >= 7) {
                // Kontrollera om produkten redan finns
                $stmtSelect->execute([$row[1]]);
                $exists = $stmtSelect->fetchColumn();

                // Om produkten inte finns, lägg till den
                if ($exists == 0) {
                    $stmtInsert->execute([$row[1], (float) $row[2], $row[4], $row[4], $row[5], $row[6]]); // Konvertera price till float
                }
            }
        }
    }

    function updateProductsFromGoogleSheet($spreadsheetId, $service)
    {
        // Hämta data från Google Sheets
        $values = getDataFromGoogleSheet($spreadsheetId, $service);

        // Här antar vi att första raden är rubriker, så vi börjar på index 1
        foreach ($values as $index => $row) {
            if ($index === 0)
                continue; // Hoppa över första raden (rubriker)

            // Kontrollera att vi har tillräckligt med data i raden
            if (count($row) >= 7) {
                $productId = (int) $row[0];        // ID från Google Sheets (kan vara i första kolumnen)
                $productName = $row[1];           // Namn från andra kolumnen
                $price = (float) $row[2];          // Pris från tredje kolumnen
                $category = $row[3];              // Kategori från fjärde kolumnen
                $descriptions = $row[4];          // Beskrivning från femte kolumnen
                $stockStatus = (int) $row[5];      // Lagerstatus från sjätte kolumnen
                $imgUrl = $row[6];                // Bild-URL från sjunde kolumnen

                // Anropa updateProduct för att uppdatera varje produkt i databasen
                $isUpdated = $this->updateProduct(
                    $spreadsheetId,   // Om det behövs för Google Sheets
                    $service,         // Om det behövs för Google Sheets
                    $this,            // Databasinstansen
                    $productId,       // Produktens ID
                    $productName,     // Produktens namn
                    $price,           // Produktens pris
                    $category,        // Produktens kategori
                    $descriptions,    // Produktens beskrivning
                    $stockStatus,     // Produktens lagerstatus
                    $imgUrl           // Produktens bild-URL
                );

                if ($isUpdated) {
                    echo "Produkt $productId uppdaterades framgångsrikt.\n";
                } else {
                    echo "Produkt $productId kunde inte uppdateras.\n";
                }
            }
        }
    }
    function updateProduct($spreadsheetId, $service, $database, $productId, $productName, $price, $category, $descriptions, $stockStatus, $imgUrl)
    {
        echo "Produkt $productId: $productName, $price, $category, $descriptions, $stockStatus, $imgUrl\n";

        // Förbered SQL-satsen för att uppdatera produkten
        $sqlUpdate = "UPDATE products SET productName = ?, price = ?, category = ?, descriptions = ?, stockStatus = ?, imgUrl = ? WHERE id = ?";
        $stmtUpdate = $this->pdo->prepare($sqlUpdate);

        // Utför uppdateringen
        $stmtUpdate->execute([$productName, $price, $category, $descriptions, $stockStatus, $imgUrl, $productId]);

        // Kontrollera om någon rad påverkades (dvs. om produkten uppdaterades)
        if ($stmtUpdate->rowCount() > 1) {
            return true; // Produkt uppdaterades framgångsrikt
        } else {
            return false; // Ingen förändring, antingen produkten finns inte eller inga ändringar gjordes
        }
    }

    function getProductIds()
    {
        $sql = "SELECT id FROM products";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();

        // Hämta alla ID:n som en array
        $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
        return $ids;
    }


    function decreaseStockStatus($productName)
    {
        // Förbered SQL-satsen för att minska lagret
        $sqlUpdate = "UPDATE products SET stockStatus = stockStatus - 1 WHERE productName = ? AND stockStatus > 0";
        $stmtUpdate = $this->pdo->prepare($sqlUpdate);

        // Utför uppdateringen
        $stmtUpdate->execute([$productName]);

        // Kontrollera om någon rad påverkades (dvs. om lagret minskades)
        if ($stmtUpdate->rowCount() > 1) {
            return true; // Lager minskades framgångsrikt
        } else {
            return false; // Ingen förändring, antingen produkten finns inte eller lagret är redan 0
        }
    }
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['insertProducts'])) {
        // Kör insertProductsIntoDatabase
        $database->insertProductsIntoDatabase($spreadsheetId, $service, $database);
        echo "Produkter har infogats i databasen.";
    } elseif (isset($_POST['updateProducts'])) {
        // Kör updateProductsFromGoogleSheet
        $database->updateProductsFromGoogleSheet($spreadsheetId, $service);
        echo "Produkter har uppdaterats i databasen.";
    } elseif (isset($_POST['decreaseStock'])) {
        // Kör decreaseStockStatus
        $productName = $_POST['productName'];
        if ($database->decreaseStockStatus($productName)) {
            echo "Lagerstatus för '$productName' har minskats.";
        } else {
            echo "Kunde inte minska lagerstatus för '$productName'.";
        }
    }
}
?>