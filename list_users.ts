import { query } from './db.ts';

async function listUsers() {
    try {
        // We select everything EXCEPT the password_hash (security best practice)
        const res = await query('SELECT id, username, full_name, department, email, created_at FROM users ORDER BY id ASC');

        if (res.rows.length === 0) {
            console.log('📭 Database is empty.');
        } else {
            console.log(`\n👥 Found ${res.rows.length} current users:`);
            console.table(res.rows); // This prints a beautiful table in your terminal
        }
    } catch (err) {
        console.error('Error fetching users:', err);
    }
}

listUsers();