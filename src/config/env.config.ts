import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const R2_BUCKET = process.env.R2_BUCKET || '';
export const R2_ENDPOINT = process.env.R2_ENDPOINT || '';
export const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
export const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';

export const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
export const BUCKET_PUBLIC_URL = process.env.BUCKET_PUBLIC_URL || '';