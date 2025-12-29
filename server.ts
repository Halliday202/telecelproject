import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { query } from './db.ts'; // Your database connection
import bcrypt from 'bcrypt';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Allows your frontend to talk to this server
app.use(bodyParser.json());

// --- ROUTES ---

// 1. LOGIN ROUTE
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const sql = 'SELECT * FROM users WHERE username = $1';
        const result = await query(sql, [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const user = result.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        // Success! Send back user info (but NOT the password)
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                department: user.department,
                role: user.role, // You might want to add a 'role' column to your DB later
                companyId: 'TC-EMP-' + user.id // Fake company ID for now
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
    console.log(`   (Ready to accept requests from your frontend)`);
});