import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { getAllProducts, getProductById } from './db/fetchProducts';
import { configureSession, configurePassport, authenticateGoogle, handleGoogleCallback, logoutUser  } from './googlelogin/googleLogin';
import passport from 'passport';
import cors from 'cors';
import path from 'path';


const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public', {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'text/javascript');
        }
    }
}));
//produkter 
app.get('/products', (req: Request, res: Response) => {
    getAllProducts((err:any, products:[]) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(products);
    });
});

// Route för att hämta en specifik produkt
app.get('/products/:id', (req:Request, res: Response) => {
    const productId:string = req.params.id;
    getProductById(productId, (err:any, product:[]) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (product.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    });
});


//google
// Konfigurera session och Passport
app.use(configureSession());
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Definiera rutter
app.get('/auth/google', authenticateGoogle());
app.get('/auth/google/callback', handleGoogleCallback as (req: Request, res: Response) => Promise<void>);
app.get('/logout', logoutUser as (req: Request, res: Response) => Promise<void>);



app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});