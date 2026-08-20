import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASS || 1234), // Forces the number to be a string
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'disaster_db'
});

pool.on('connect', () => {
  console.log('Successfuly connected');
});

pool.on('error', (err : Error) => {
  console.error('error in db', err);
  process.exit(-1);
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  pool,
};