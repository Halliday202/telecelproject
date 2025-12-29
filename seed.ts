import { query } from './db.ts';
import bcrypt from 'bcrypt';

async function createEmployee() {
    // --- CONFIGURATION ---
    const username = 'admin';
    const fullName = 'System Administrator';
    const email = 'admin@telecel.com';
    const department = 'IT Department';
    const plainPassword = 'grimreaper';
    const role = 'ADMIN';

    try {
        console.log(`🔒 Hashing password for ${username}...`);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        console.log('📝 Inserting into database...');

        // We added "role" to this query
        const sql = `
            INSERT INTO users (username, full_name, email, department, password_hash, role) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id, username, role;
        `;

        const res = await query(sql, [username, fullName, email, department, hashedPassword, role]);

        console.log('✅ SUPER USER created successfully!');
        console.table(res.rows[0]);

    } catch (err: any) {
        console.error('❌ Error creating user:', err.message);
        if (err.code === '23505') {
            console.log('💡 TIP: Run "npx ts-node delete_user.ts" first!');
        }
    }
}

createEmployee();