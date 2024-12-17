import db from './db';

// Funktion för att hämta alla produkter
export const getAllProducts = (callback:any) => {
    const sql = 'SELECT * FROM products';
    db.query(sql, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};

// Funktion för att hämta en produkt med ett specifikt id
export const getProductById = (id:string, callback:any) => {
    const sql = 'SELECT * FROM products WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};





