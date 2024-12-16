import express, { Request, Response } from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

// Skapa MySQL-anslutning
const db = mysql.createConnection({
    host: process.env.DB_SERVERNAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME
});

// Anslut till databasen
db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to the database');
});

// Hämta produkter från databasen
app.get("/products", (req: Request, res: Response) => {
    const sql = 'SELECT * FROM products';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send('Error retrieving products');
            return;
        }
        res.json(results);
    });
});


app.get("/product/:id", (req: Request, res: Response) => {
    const sql = 'SELECT * FROM products WHERE id = ?';
    db.query(sql, [req.params.id], (err, results) => {
        if(err){
            res.status(500).send('Error retrieving product');
            return;
        }
        res.json(results);
    })
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
