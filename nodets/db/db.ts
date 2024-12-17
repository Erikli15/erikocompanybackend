import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

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

export default db;
