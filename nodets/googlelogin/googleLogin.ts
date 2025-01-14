// Import necessary modules
import dotenv from 'dotenv'; // To load environment variables from a .env file
import passport from 'passport'; // For authentication middleware
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'; // Google OAuth strategy for passport
import session from 'express-session'; // For session management

// Load environment variables
dotenv.config();

// Retrieve Google OAuth credentials and session secret from environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ""; 
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const COOKIE_SECRET_KEY = process.env.COOKIE_SECRET_KEY || 'default_secret_key';

// Function to configure session middleware
export const configureSession = () => {
    return session({
        secret: COOKIE_SECRET_KEY, // Secret key to sign session ID cookie
        resave: false, // Do not resave session if not modified
        saveUninitialized: true, // Save sessions that are new but not modified
        cookie: { secure: false }  // Cookie will be sent over HTTP as it's not using HTTPS
    });
};

// Function to configure Passport.js with Google OAuth
export const configurePassport = () => {
    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID, // Google OAuth client ID
        clientSecret: GOOGLE_CLIENT_SECRET, // Google OAuth client secret
        callbackURL: 'http://localhost:3000/auth/google/callback', // URL to redirect after authentication
    },
    // Callback function after successful authentication
    (accessToken: string, refreshToken: string, profile: any, done: Function) => {
        return done(null, profile); // Send profile information to the next step
    }));

    // Serialize user information into the session
    passport.serializeUser((user: any, done: Function) => {
        done(null, user); // Save user data into the session
    });

    // Deserialize user from the session
    passport.deserializeUser((obj: any, done: Function) => {
        done(null, obj); // Retrieve user data from the session
    });
};

// Function to authenticate the user with Google OAuth
export const authenticateGoogle = (req: any, res: any) => {
    // Save the previous page (for redirect after login) in the session
    req.session.previousPage = req.headers.referer || 'http://localhost:4200/';

    // Start the Google OAuth authentication process
    return passport.authenticate('google', {
        scope: ['profile', 'email'], // Scope for Google profile and email access
        prompt: 'select_account' // Prompt user to select an account
    })(req, res);
};

// Function to handle the callback from Google OAuth after authentication
export const handleGoogleCallback = async (req: any, res: any) => {
    return new Promise((resolve: Function, reject: Function) => {
        // Authenticate with Google and handle success/failure
        passport.authenticate("google", { failureRedirect: "/login" }, (err, user, info) => {
            if (err) {
                return reject(err); // Handle errors during authentication
            }
            if (!user) {
                return reject(new Error("No user found")); // If no user is found, reject the promise
            }
            // Log the user in and store the session
            req.logIn(user, (err: any) => {
                if (err) {
                    return reject(err); // Handle login errors
                }

                // Redirect user to the previous page (or default to localhost:4200)
                const previousPage = req.session.previousPage || 'http://localhost:4200/';
                res.redirect(previousPage);
                resolve(); // Resolve the promise after successful login
            });
        })(req, res); // Pass the request and response to the authenticate method
    });
};

// Function to log out the user and destroy the session
export const logoutUser = async (req: any, res: any) => {
    return new Promise((resolve: Function, reject: Function) => {
        // Log the user out of the session
        req.logout((err: any) => { 
            if (err) {
                return reject(err); // Handle errors during logout
            }
            
            // Destroy the session after logging out
            req.session.destroy((err: any) => {
                if (err) {
                    return reject(err); // Handle errors during session destruction
                }
                // Redirect user to the previous page or default to localhost:4200
                const previousPage = req.session.previousPage || 'http://localhost:4200/';
                res.redirect(previousPage);
                resolve(); // Resolve the promise after successful logout
            });
        });
    });
};
