import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.SERVER_PORT || 5000;
export const DATABASE_URL = process.env.DATABASE_URL;
export const DIRECT_URL = process.env.DIRECT_URL;
export const NODE_ENV = process.env.NODE_ENV || 'development';

if (!DATABASE_URL) {
  throw new Error('❌ DATABASE_URL is required');
}