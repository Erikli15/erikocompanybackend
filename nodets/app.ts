import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { getAllProducts, getProductById } from './db/fetchProducts';
import { configureSession, configurePassport, authenticateGoogle, handleGoogleCallback, logoutUser } from './googlelogin/googleLogin';
import passport from 'passport';

const app = express();
const port = 3000;
app.use(bodyParser.json());


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
app.use(configureSession());
app.use(passport.initialize());
app.use(passport.session());
configurePassport();
app.get('/auth/google', authenticateGoogle());
app.get('/auth/google/callback', handleGoogleCallback);
app.get('/logout', logoutUser );
app.get("/", (req: Request, res: Response) => {
    if(req.isAuthenticated()){
        res.send(`<h1>Welcome Namn:Erik</h1><br><button><a href='/logout'Logout</a></button>`);
    } else{
        res.send(`<button><a href='/auth/google'>Login with Google</a></button>`);
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});