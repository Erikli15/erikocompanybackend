<?php
error_reporting(E_ALL & ~E_DEPRECATED);
// Inkludera filen som innehåller getDataFromGoogleSheet-funktionen
require 'googleSheet.php';
require 'vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$database = new Databas();

$database->insertProductsIntoDatabase($spreadsheetId, $service, $database);

class Databas
{

    public $pdo;

    function __construct()
    {
        $username = $_ENV['DB_USERNAME'];
        $password = $_ENV['DB_PASSWORD'];
        $host = $_ENV['DB_SERVERNAME'];
        $dbname = $_ENV['DB_DBNAME'];
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
        $sql = "INSERT INTO products (productName, price, category, descriptions, stockStatus) VALUES (?,?,?,?,?)";
        $stmt = $database->pdo->prepare($sql);

        // Loop genom varje rad av data
        foreach ($values as $index => $row) {
            if ($index === 0)
                continue; // Hoppa över första raden (rubriker)

            // Kontrollera att raden har tillräckligt med kolumner
            if (count($row) >= 6) {
                // Bind värdena till frågan
                $stmt->execute([$row[1], (float) $row[2], $row[4], $row[4], $row[5]]); // Konvertera price till float
            }
        }
    }

}
?>