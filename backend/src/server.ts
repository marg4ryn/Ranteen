import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  if (!process.env.CLIENT_URL) console.warn("CLIENT_URL is not set in .env. CORS and OAuth redirects might not work correctly.");
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) console.warn("Google OAuth credentials are not set. Student login will fail.");

});