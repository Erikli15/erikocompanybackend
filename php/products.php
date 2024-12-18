<?php
error_reporting(E_ALL & ~E_DEPRECATED);
// Inkludera filen som innehåller getDataFromGoogleSheet-funktionen
require_once "googleSheet.php";
require "vendor/autoload.php";
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../'); // Adjust the path as necessary
$dotenv->load();

$database = new Databas();

$database->insertProductsIntoDatabase($spreadsheetId, $service, $database);

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
            if (count($row) >= 6) {
                // Kontrollera om produkten redan finns
                $stmtSelect->execute([$row[1]]);
                $exists = $stmtSelect->fetchColumn();

                // Om produkten inte finns, lägg till den
                if ($exists == 0) {
                    $stmtInsert->execute([$row[1], (float) $row[2], $row[4], $row[4], $row[5]]); // Konvertera price till float
                }
            }
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
}

?>