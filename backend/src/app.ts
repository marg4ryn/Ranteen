import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo'; // For storing sessions in MongoDB
import passportConfig from './config/passport'; // Initializes passport strategies
import passport from 'passport'; // The actual passport object

import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
// Import other routes as they are created
import dishRoutes from './routes/dishRoutes';
import menuRoutes from './routes/menuRoutes';
import ratingRoutes from './routes/ratingRoutes';
import commentRoutes from './routes/commentRoutes';

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // Allow frontend to connect
  credentials: true, // Important for sessions/cookies
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session Middleware
// Make sure MONGO_URI and SESSION_SECRET are set in .env
const mongoURI = process.env.MONGO_URI;
const sessionSecret = process.env.SESSION_SECRET;

if (!mongoURI || !sessionSecret) {
  console.error("MONGO_URI or SESSION_SECRET not defined in .env file. Session store will not work.");
  process.exit(1);
}

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false, // Don't create session until something stored
    store: MongoStore.create({ 
        mongoUrl: mongoURI,
        collectionName: 'sessions' // Optional: name of the sessions collection
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true if https
      httpOnly: true, // Prevent client-side JS from accessing the cookie
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site, 'lax' for same-site
    },
  })
);

// Passport Middleware
// passportConfig is already called, so strategies are registered.
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/api/health', (req: Request, res: Response) => { res.status(200).send('OK') });
app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/comments', commentRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  // Check for specific error types if needed
  res.status(500).send({ message: 'Something broke!', error: err.message });
});

// 404 Handler for unmatched routes
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: "Not Found - The requested resource does not exist on this server." });
});


export default app;