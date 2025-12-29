import { query } from './db';

async function testConnection() {
    try {
        console.log("Attempting to connect...");
        // This simple query asks the DB for the current time
        const res = await query('SELECT NOW()');
        console.log("Success! Database time is:", res.rows[0]);
    } catch (err) {
        console.error("Connection failed:", err);
    }
}

testConnection();