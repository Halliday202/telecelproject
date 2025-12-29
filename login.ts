import { query } from './db.ts';
import bcrypt from 'bcrypt';

async function login(usernameInput: string, passwordInput: string) {
    console.log(`\n🔑 Attempting login for: ${usernameInput}`);

    try {
        // 1. Find the user by username
        // We only ask for the fields we need (id, password_hash, etc.)
        const sql = 'SELECT id, username, password_hash, full_name FROM users WHERE username = $1';
        const result = await query(sql, [usernameInput]);

        // 2. Check if user exists
        if (result.rows.length === 0) {
            console.log('❌ User not found!');
            return;
        }

        const user = result.rows[0];

        // 3. The Magic Moment: Compare the plain password with the stored hash
        // bcrypt.compare() does the math to see if they match without revealing the password
        const isMatch = await bcrypt.compare(passwordInput, user.password_hash);

        if (isMatch) {
            console.log(`✅ SUCCESS! Welcome back, ${user.full_name}.`);
            console.log(`   (User ID: ${user.id})`);
        } else {
            console.log('❌ WRONG PASSWORD! Access denied.');
        }

    } catch (err) {
        console.error('System Error:', err);
    }
}

// --- TEST ZONE ---

// Test 1: Correct credentials (should work)
login('kwamz', 'pass123');

// Test 2: Wrong password (should fail)
// setTimeout just ensures this runs after the first one so logs don't mix
setTimeout(() => {
    login('kwamz', 'WrongPass');
}, 1000);