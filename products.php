<?php
// Inkludera filen som innehåller getDataFromGoogleSheet-funktionen
require 'googleSheet.php';
require 'vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$username = $_ENV['DB_USERNAME'];
$password = $_ENV['DB_PASSWORD'];
$host = $_ENV['DB_SERVERNAME'];
$dbname = $_ENV['DB_DBNAME'];

// Anslut till databasen
$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8";


try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $data = getDataFromGoogleSheet($spreadsheetId, $service);

    // Infoga data i databasen
    insertDataIntoDatabase($data, $pdo);

    echo "Data har framgångsrikt infogats i databasen.";
} catch (PDOException $e) {
    echo "Databasfel: " . $e->getMessage();
}

function insertDataIntoDatabase($data, $pdo)
{
    // Förbered SQL-frågan för att infoga data
    $stmt = $pdo->prepare("INSERT INTO products (productName, price, category, descriptions, stockStatus) VALUES (?, ?, ?, ?, ?)");

    // Loop igenom varje rad av data, börja från andra raden (index 1)
    foreach ($data as $index => $row) {
        if ($index === 0)
            continue; // Hoppa över första raden (rubriker)

        // Kontrollera att raden har tillräckligt med kolumner
        if (count($row) >= 6) {
            // Bind värdena till frågan
            $stmt->execute([$row[1], (float) $row[2], $row[4], $row[4], $row[5]]); // Konvertera price till float
        }
    }
}
?>