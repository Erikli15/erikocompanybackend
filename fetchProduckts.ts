import express, { Request, Response } from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';

dotenv.config();

//Expressservice 
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

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
