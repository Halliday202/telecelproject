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

// --- TICKET ROUTES ---

// 1. GET ALL TICKETS
app.get('/api/tickets', async (req, res) => {
    try {
        // We join with users to get the name of the person who created the ticket
        // The frontend expects "userId" but DB has "user_id", so we rename it in SQL
        const sql = `
            SELECT t.id, t.user_id as "userId", t.title, t.description, 
                   t.department, t.status, t.created_at as "createdAt", 
                   t.screenshot_url as "screenshotUrl"
            FROM tickets t
            ORDER BY t.created_at DESC
        `;
        const result = await query(sql);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch tickets" });
    }
});

// 2. CREATE A TICKET
app.post('/api/tickets', async (req, res) => {
    const { userId, title, description, department, screenshotUrl } = req.body;

    try {
        const sql = `
            INSERT INTO tickets (user_id, title, description, department, screenshot_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, user_id as "userId", title, description, department, status, created_at as "createdAt";
        `;
        const result = await query(sql, [userId, title, description, department, screenshotUrl]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create ticket" });
    }
});

// 3. UPDATE TICKET STATUS (For Admin)
app.put('/api/tickets/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const sql = `
            UPDATE tickets 
            SET status = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2
            RETURNING *;
        `;
        await query(sql, [status, id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update status" });
    }
});