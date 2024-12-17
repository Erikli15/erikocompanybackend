import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';

dotenv.config();

// Google login
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const COOKIE_SECRET_KEY = process.env.COOKIE_SECRET_KEY || 'default_secret_key';

export const configureSession = () => {
    return session({
        secret: COOKIE_SECRET_KEY,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } // Ställ in till true om du använder HTTPS
    });
};

export const configurePassport = () => {
    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/callback',
    },
    (accessToken: string, refreshToken: string, profile: any, done: Function) => {
        return done(profile);
    }));

    passport.serializeUser ((user: any, done: Function) => {
        done(user);
    });

    passport.deserializeUser ((obj: any, done: Function) => {
        done(obj);
    });
};

export const authenticateGoogle = () => {
    return passport.authenticate("google", {
        scope: ["profile", "email"],
    });
};

export const handleGoogleCallback = () => {
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req: any, res: any) => {
        res.redirect("/");
    };
};

export const logoutUser  = (req: any, res: any) => {
    req.logout(() => {
        res.redirect("/");
    });
};

