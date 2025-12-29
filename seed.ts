import { query } from './db.ts';
import bcrypt from 'bcrypt';

async function createEmployee() {
    const username = 'jamie';
    const fullName = 'James Bond';
    const email = 'jamie@telecel.com.gh';
    const department = 'Customer Support';
    const plainPassword = 'nigga';

    try {
        console.log(`🔒 Hashing password for ${username}...`);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        console.log('📝 Inserting into database...');

        // Updated SQL to include username
        const sql = `
            INSERT INTO users (username, full_name, email, department, password_hash) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, username, full_name;
        `;

        // Added username to the list of data we send
        const res = await query(sql, [username, fullName, email, department, hashedPassword]);

        console.log('✅ User created successfully!');
        console.table(res.rows[0]);

    } catch (err) {
        console.error('❌ Error creating user:', err);
    }
}

createEmployee();