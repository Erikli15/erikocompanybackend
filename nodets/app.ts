import express, { Request, Response } from 'express'; // Importing express and related types
import bodyParser from 'body-parser'; // Middleware to parse incoming request bodies
import { getAllProducts, getProductById } from './db/fetchProducts'; // Importing product fetching functions
import { configureSession, configurePassport, authenticateGoogle, handleGoogleCallback, logoutUser } from './googlelogin/googleLogin'; // Google login related imports
import { createKlarnaOrder } from './klarna/klarnaService'; // Importing Klarna service to handle order creation
import passport from 'passport'; // Passport for authentication
import cors from 'cors'; // CORS middleware for cross-origin requests
import { console } from 'inspector'; // Importing console (likely for debugging)

// Create an Express application
const app = express();
const port = 3000; // Port number for the server to listen on

// Use bodyParser middleware to parse JSON bodies
app.use(bodyParser.json());

// Enable CORS to allow requests from localhost:4200 (typically used for Angular frontend)
app.use(cors({
    origin: 'http://localhost:4200', 
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Serve static files from the 'public' directory
app.use(express.static('public', {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'text/javascript');
        }
    }
}));

// Route to fetch all products
app.get('/products', (req: Request, res: Response) => {
    // Get all products from the database
    getAllProducts((err: any, products: []) => {
        if (err) {
            // If there’s a database error, return 500
            return res.status(500).json({ error: 'Database error' });
        }
        // Send the products in the response
        res.json(products);
    });
});

// Route to fetch a single product by its ID
app.get('/products/:id', (req: Request, res: Response) => {
    const productId: string = req.params.id; // Extract product ID from request parameters
    // Get product by ID from the database
    getProductById(productId, (err: any, product: []) => {
        if (err) {
            // If there’s a database error, return 500
            return res.status(500).json({ error: 'Database error' });
        }
        if (product.length === 0) {
            // If no product is found, return 404
            return res.status(404).json({ error: 'Product not found' });
        }
        // Send the product in the response
        res.json(product);
    });
});

// Simple route for the home page
app.get('/', (req: Request, res: Response) => {
    res.send("Hej"); // Send a simple greeting
});

// Set up session and passport for user authentication
app.use(configureSession()); // Initialize session middleware
app.use(passport.initialize()); // Initialize Passport.js
app.use(passport.session()); // Enable session-based authentication
configurePassport(); // Configure Passport.js strategies for authentication

// Google authentication routes
app.get('/auth/google', authenticateGoogle); // Route to start Google OAuth login
app.get('/auth/google/callback', handleGoogleCallback as (req: express.Request, res: express.Response) => Promise<void>); // Callback after Google authentication
app.get('/logout', logoutUser as (req: express.Request, res: express.Response) => Promise<void>); // Route to log out the user

// Route to create an order via Klarna
app.post('/api/create-order', async (req, res) => {
    try {
        const orderData = req.body; // Get the order data from the request body
        // Call Klarna service to create the order
        const klarnaOrderResponse = await createKlarnaOrder(orderData);
        // Respond with Klarna's response data
        res.status(200).json(klarnaOrderResponse);
    } catch (error) {
        // If there’s an error, log it and send a 500 status
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Start the Express server and listen on the specified port
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`); // Log when the server starts
});
