import express, { Request, response, Response } from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import bodyParser from 'body-parser';
// import KlarnaService from './klarnaService';
import axios from 'axios';
import { error } from 'console';

dotenv.config();

//Expressservice 
const app = express();
const port = 3000;
app.use(bodyParser.json());

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


//google loggin
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const COOKIE_SECRET_KEY = process.env.COOKIE_SECRET_KEY || 'default_secret_key';

app.use(
    session({
      secret: COOKIE_SECRET_KEY, // Byt ut med en säker nyckel
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false } // Ställ in till true om du använder HTTPS
    })
);


app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback',
},
(accessToken: string, refreshToken: string, profile: any, done: Function) =>{
    return done(null, profile);
}
));

passport.serializeUser((user:any, done: Function) => {
    done(null, user);
});

passport.deserializeUser((obj: any, done: Function) => {
    done(null, obj);
});

app.get("/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req: Request, res: Response) => {
        res.redirect("/");
    }   
);


app.get("/logout", (req: Request, res: Response) => {
    req.logout((err: any) => {
        res.redirect("/");
    });
})

app.get("/", (req: Request, res: Response) => {
    if(req.isAuthenticated()){
        res.send(`<h1>Welcome Namn:Erik</h1><br><button><a href='/logout'Logout</a></button>`);
    } else{
        res.send(`<button><a href='/auth/google'>Login with Google</a></button>`);
    }
});

//klarna

const API_KLARNA = process.env.KLARNA_API_KEY || 'default_secret_key';
const KLARNA_USER = process.env.KLARNA_USER || 'default_user';

interface OrderLine {
  type: string;
  reference: string;
  name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total_amount: number;
  total_discount_amount: number;
  total_tax_amount: number;
  image_url: string;
  product_url: string;
}

interface MerchantUrls {
  authorization: string;
}

interface OrderRequest {
  acquiring_channel: string;
  intent: string;
  purchase_country: string;
  purchase_currency: string;
  locale: string;
  order_amount: number;
  order_tax_amount: number;
  order_lines: OrderLine[];
  merchant_urls: MerchantUrls;
}

interface KlarnaResponse {
  session_id?: string; // Gör den valfri med '?'
  // Lägg till andra fält som kan finnas i svaret om det behövs
}


const basicAuth = Buffer.from(`${KLARNA_USER}:${API_KLARNA}`).toString('base64');

const orderRequest: OrderRequest = {
  acquiring_channel: "ECOMMERCE",
  intent: "buy",
  purchase_country: "SE",
  purchase_currency: "SEK",
  locale: "en-SE",
  order_amount: 9500,
  order_tax_amount: 1900,
  order_lines: [
    {
      type: "physical",
      reference: "19-402",
      name: "Battery Power Pack",
      quantity: 1,
      unit_price: 10000,
      tax_rate: 2500,
      total_amount: 9500,
      total_discount_amount: 500,
      total_tax_amount: 1900,
      image_url: "https://www.exampleobjects.com/logo.png",
      product_url: "https://www.estore.com/products/f2a8d7e34"
    }
  ],
  merchant_urls: {
    authorization: "https://example.com/authorization_callbacks"
  }
};

let sessionId: string | undefined;

axios.post<KlarnaResponse>('https://api.playground.klarna.com/payments/v1/sessions', orderRequest, {
  headers: {
    'Authorization': `Basic ${basicAuth}` // Använd Basic Auth
  }
})
  .then(response => {
    if (response.data && response.data.session_id) {
      sessionId = response.data.session_id;
      console.log('Session ID:', sessionId);

      // Gör en GET-begäran med sessionId här
      return axios.get<KlarnaResponse>(`https://api.playground.klarna.com/payments/v1/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Basic ${basicAuth}`
        }
      });
    } else {
      console.log("session_id finns inte i response.data");
    }
  })
  .then(response => {
    if (response) {
      console.log(response.data);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
