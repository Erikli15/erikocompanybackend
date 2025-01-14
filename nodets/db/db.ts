import mysql from 'mysql2';  // Import the mysql2 package for database connection
import dotenv from 'dotenv';  // Import dotenv to load environment variables

dotenv.config();  // Load environment variables from the .env file

// Create MySQL connection using environment variables for credentials
const db = mysql.createConnection({
    host: process.env.DB_SERVERNAME,  // Database server host
    user: process.env.DB_USERNAME,    // Database username
    password: process.env.DB_PASSWORD, // Database password
    database: process.env.DB_DBNAME   // Name of the database to connect to
});

// Establish a connection to the database
db.connect(err => {
    if (err) {  // If there's an error during the connection
        console.error('Database connection failed: ' + err.stack);  // Log the error stack
        return;  // Exit the function if connection fails
    }
    console.log('Connected to the database');  // Log success message if connected
});

export default db;  // Export the database connection to be used elsewhere

