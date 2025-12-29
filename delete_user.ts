import { query } from './db.ts';

async function deleteUser(usernameTarget: string) {
    try {
        console.log(`🗑️  Attempting to delete user: ${usernameTarget}...`);

        const res = await query('DELETE FROM users WHERE username = $1 RETURNING id, full_name', [usernameTarget]);

        if (res.rowCount === 0) {
            console.log(`❌ User "${usernameTarget}" not found. No one was deleted.`);
        } else {
            console.log(`✅ DELETED: ${res.rows[0].full_name} (ID: ${res.rows[0].id}) was removed.`);
        }
    } catch (err) {
        console.error('System Error:', err);
    }
}

// Change this string to whoever you want to delete
deleteUser('kwame_tech');