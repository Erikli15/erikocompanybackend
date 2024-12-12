const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

// Skapa MySQL-anslutning
const db = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: ''
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to the database');
});

// Hämta produkter från databasen
app.get('/products', (req, res) => {
    const sql = 'SELECT * FROM products';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send('Error retrieving products');
            return;
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
