import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const COOKIE_SECRET_KEY = process.env.COOKIE_SECRET_KEY || 'default_secret_key';

export const configureSession = () => {
    return session({
        secret: COOKIE_SECRET_KEY,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } // Set to true if using HTTPS
    });
};

export const configurePassport = () => {
    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/callback',
    },
    (accessToken: string, refreshToken: string, profile: any, done: Function) => {
        return done(null, profile);
    }));

    passport.serializeUser ((user: any, done: Function) => {
        done(null, user);
    });

    passport.deserializeUser ((obj: any, done: Function) => {
        done(null, obj);
    });
};

export const authenticateGoogle = (req: any, res: any) => {
    // Save the current URL in the session before login
    req.session.previousPage = req.headers.referer || 'http://localhost:4200/';
    
    return passport.authenticate('google', {
        scope: ['profile', 'email'], // Scope to access profile and email
        prompt: 'select_account' // Ask the user to select an account every time
    })(req, res);
};

export const handleGoogleCallback = async (req: any, res: any) => {
    return new Promise((resolve: Function, reject: Function) => {
        passport.authenticate("google", { failureRedirect: "/login" }, (err, user, info) => {
            if (err) {
                return reject(err);
            }
            if (!user) {
                return reject(new Error("No user found"));
            }
            req.logIn(user, (err: any) => {
                if (err) {
                    return reject(err);
                }

                // Retrieve the saved URL from the session and redirect the user
                const previousPage = req.session.previousPage || 'http://localhost:4200/';
                res.redirect(previousPage);
                resolve();
            });
        })(req, res);
    });
};

export const logoutUser  = async (req: any, res: any) => {
    return new Promise((resolve: Function, reject: Function) => {
        req.logout((err: any) => { // Add a callback function here
            if (err) {
                return reject(err);
            }
            // Clear the saved URL from the session
            req.session.destroy((err: any) => {
                if (err) {
                    return reject(err);
                }
                const previousPage = req.session.previousPage || 'http://localhost:4200/';
                res.redirect(previousPage);
                resolve()
            });
        });
    });
};