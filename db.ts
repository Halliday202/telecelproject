import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// I took this directly from your screenshot
const connectionString = 'postgres://postgres:rimgreaper@localhost:5432/telecel_db';

const envDbUrl = process.env.DATABASE_URL;
const dbUrlToUse =
  envDbUrl && (envDbUrl.startsWith('postgres://') || envDbUrl.startsWith('postgresql://'))
    ? envDbUrl
    : connectionString;

const pool = new Pool({
  connectionString: dbUrlToUse,
});

// Log which DB URL is used (hide password part)
const safeUrl = dbUrlToUse.replace(/:\/\/(.*@)/, '://***@');
console.log('Using database URL:', safeUrl);

pool.on('error', (err) => {
  console.error('Unexpected DB error', err);
});

// Quick startup test to surface connection problems immediately
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('DB connection test succeeded');
  } catch (err: any) {
    console.error('DB connection test failed:', err.message || err);
  }
})();

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
};