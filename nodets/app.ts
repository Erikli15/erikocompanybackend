import express, { Request, response, Response } from 'express';
import bodyParser from 'body-parser';
import { getAllProducts, getProductById } from './db/fetchProducts';
import { configureSession, configurePassport, authenticateGoogle, handleGoogleCallback, logoutUser  } from './googlelogin/googleLogin';
import { createKlarnaOrder} from './klarna/klarnaService'; // Import service function
import passport from 'passport';
import cors from 'cors';

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(cors({
    origin: ' http://localhost:4200/', // Din frontend URL
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  }));
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

app.get('/', (req:Request, res:Response) =>{
    res.send("Hej");
})

// Configure session and Passport
app.use(configureSession());
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Define routes
app.get('/auth/google', authenticateGoogle);
app.get('/auth/google/callback', handleGoogleCallback as (req: express.Request, res: express.Response) => Promise<void>);
app.get('/logout', logoutUser  as (req: express.Request, res: express.Response) => Promise<void>);


app.post('/api/create-order', async (req, res) => {
    try {
      const orderData = req.body;
      const klarnaOrderResponse = await createKlarnaOrder(orderData);
      res.status(200).json(klarnaOrderResponse);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });
  
  
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})