import db from './db';  // Import the database connection from the 'db' module

// Function to fetch all products from the 'products' table
export const getAllProducts = (callback:any) => {
    const sql = 'SELECT * FROM products';  // SQL query to select all products
    db.query(sql, (err, results) => {  // Execute the query
        if (err) {  // If there's an error during the query
            return callback(err, null);  // Return the error through the callback
        }
        callback(null, results);  // If successful, pass the results to the callback
    });
};

// Function to fetch a specific product by its ID from the 'products' table
export const getProductById = (id:string, callback:any) => {
    const sql = 'SELECT * FROM products WHERE id = ?';  // SQL query to select a product by its ID
    db.query(sql, [id], (err, results) => {  // Execute the query with the provided ID
        if (err) {  // If there's an error during the query
            return callback(err, null);  // Return the error through the callback
        }
        callback(null, results);  // If successful, pass the results to the callback
    });
};






