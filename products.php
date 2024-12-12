<?php
require 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();


// Nu kan du använda $client med den autentiserade access token
// Din kod för att interagera med Google Sheets API här...





// Nu kan du använda $service för att interagera med Google Sheets API

// Nu kan du använda $client för att göra API-anrop

// } else {
// foreach ($values as $row) {
// // Anslut till din databas (exempel med MySQL)
// $servername = getenv('DB_SERVERNAME');
// $username = getenv('DB_USERNAME');
// $password = getenv('DB_PASSWORD');
// $dbname = getenv('DB_DBNAME');

// // Skapa anslutning
// $conn = new mysqli($servername, $username, $password, $dbname);

// if ($conn->connect_error) {
// die("Connection failed: " . $conn->connect_error);
// }

// // Förutsätt att kolumnerna är Produktnamn, Pris, Kategori, Lagerstatus
// $productName = $row[0];
// $price = $row[1];
// $category = $row[2];
// $stockStatus = $row[3];

// // SQL-insert
// $sql = "INSERT INTO products (product_name, price, category, stock_status)
// VALUES ('$productName', '$price', '$category', '$stockStatus')";

// if ($conn->query($sql) === TRUE) {
// echo "New record created successfully\n";
// } else {
// echo "Error: " . $sql . "<br>" . $conn->error;
// }

// $conn->close();
// }
// }
?>