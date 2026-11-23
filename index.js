
const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(express.json());

// =====================================
// TEST ROUTE
// =====================================

app.get('/', (req, res) => {
    res.send('Event Registration API is running!');
});


// =====================================
// EVENTS ROUTES
// =====================================

// GET ALL EVENTS
app.get('/events', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM events ORDER BY id ASC'
        );

        res.status(200).json(result.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// GET EVENT BY ID
app.get('/events/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM events WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Event not found'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// CREATE EVENT
app.post('/events', async (req, res) => {
    try {
        const {
            title,
            description,
            event_date,
            location,
            capacity
        } = req.body;

        if (!title || !event_date || !location ||
            !Number.isInteger(capacity) || capacity <= 0) {
            return res.status(400).json({
                message: 'Please provide valid event data'
            });
        }

        const result = await pool.query(
            `INSERT INTO events
            (title, description, event_date, location, capacity)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [title, description || null, event_date, location, capacity]
        );

        res.status(201).json({
            message: 'Event created successfully',
            event: result.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// UPDATE EVENT
app.put('/events/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            event_date,
            location,
            capacity
        } = req.body;

        if (!title || !event_date || !location ||
            !Number.isInteger(capacity) || capacity <= 0) {
            return res.status(400).json({
                message: 'Please provide valid event data'
            });
        }

        const result = await pool.query(
            `UPDATE events
            SET title = $1,
                description = $2,
                event_date = $3,
                location = $4,
                capacity = $5
            WHERE id = $6
            RETURNING *`,
            [title, description || null, event_date,
             location, capacity, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Event not found'
            });
        }

        res.status(200).json({
            message: 'Event updated successfully',
            event: result.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// DELETE EVENT
app.delete('/events/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM events WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Event not found'
            });
        }

        res.status(200).json({
            message: 'Event deleted successfully',
            event: result.rows[0]
        });

    } catch (err) {
        console.error(err.message);

        if (err.code === '23503') {
            return res.status(409).json({
                message: 'Cannot delete event with existing registrations'
            });
        }

        res.status(500).json({ message: 'Server error' });
    }
});


// =====================================
// USERS ROUTES
// =====================================

// CREATE USER
app.post('/users', async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: 'Name and email are required'
            });
        }

        const result = await pool.query(
            `INSERT INTO users (name, email)
            VALUES ($1, $2)
            RETURNING *`,
            [name, email]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: result.rows[0]
        });

    } catch (err) {
        console.error(err.message);

        if (err.code === '23505') {
            return res.status(409).json({
                message: 'Email already exists'
            });
        }

        res.status(500).json({ message: 'Server error' });
    }
});


// GET ALL USERS
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM users ORDER BY id ASC'
        );

        res.status(200).json(result.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// GET USER BY ID
app.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// GET USER REGISTRATIONS
app.get('/users/:id/registrations', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await pool.query(
            'SELECT id FROM users WHERE id = $1',
            [id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const result = await pool.query(
            `SELECT
                r.id AS registration_id,
                r.registration_date,
                e.id AS event_id,
                e.title AS event_title,
                e.event_date,
                e.location
             FROM registrations r
             JOIN events e ON r.event_id = e.id
             WHERE r.user_id = $1
             ORDER BY r.id ASC`,
            [id]
        );

        res.status(200).json(result.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// UPDATE USER
app.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: 'Name and email are required'
            });
        }

        const result = await pool.query(
            `UPDATE users
            SET name = $1, email = $2
            WHERE id = $3
            RETURNING *`,
            [name, email, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            message: 'User updated successfully',
            user: result.rows[0]
        });

    } catch (err) {
        console.error(err.message);

        if (err.code === '23505') {
            return res.status(409).json({
                message: 'Email already exists'
            });
        }

        res.status(500).json({ message: 'Server error' });
    }
});


// DELETE USER
app.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            message: 'User deleted successfully',
            user: result.rows[0]
        });

    } catch (err) {
        console.error(err.message);

        if (err.code === '23503') {
            return res.status(409).json({
                message: 'Cannot delete user with existing registrations'
            });
        }

        res.status(500).json({ message: 'Server error' });
    }
});


// =====================================
// REGISTRATIONS ROUTES
// =====================================

// GET ALL REGISTRATIONS
app.get('/registrations', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                r.id,
                r.registration_date,
                u.name AS user_name,
                u.email,
                e.title AS event_title,
                e.event_date
             FROM registrations r
             JOIN users u ON r.user_id = u.id
             JOIN events e ON r.event_id = e.id
             ORDER BY r.id ASC`
        );

        res.status(200).json(result.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// GET REGISTRATION BY ID
app.get('/registrations/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                r.id,
                r.user_id,
                r.event_id,
                r.registration_date,
                u.name AS user_name,
                e.title AS event_title
             FROM registrations r
             JOIN users u ON r.user_id = u.id
             JOIN events e ON r.event_id = e.id
             WHERE r.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Registration not found'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// REGISTER USER IN EVENT
app.post('/registrations', async (req, res) => {
    try {
        const { user_id, event_id } = req.body;

        if (!Number.isInteger(user_id) ||
            !Number.isInteger(event_id)) {
            return res.status(400).json({
                message: 'Valid user_id and event_id are required'
            });
        }

        const user = await pool.query(
            'SELECT id FROM users WHERE id = $1',
            [user_id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const event = await pool.query(
            'SELECT id, capacity FROM events WHERE id = $1',
            [event_id]
        );

        if (event.rows.length === 0) {
            return res.status(404).json({
                message: 'Event not found'
            });
        }

        const existing = await pool.query(
            `SELECT id FROM registrations
             WHERE user_id = $1 AND event_id = $2`,
            [user_id, event_id]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                message: 'User is already registered in this event'
            });
        }

        const count = await pool.query(
            'SELECT COUNT(*) FROM registrations WHERE event_id = $1',
            [event_id]
        );

        if (Number(count.rows[0].count) >= event.rows[0].capacity) {
            return res.status(409).json({
                message: 'Event is full'
            });
        }

        const result = await pool.query(
            `INSERT INTO registrations (user_id, event_id)
             VALUES ($1, $2)
             RETURNING *`,
            [user_id, event_id]
        );

        res.status(201).json({
            message: 'Registration created successfully',
            registration: result.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// DELETE REGISTRATION
app.delete('/registrations/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM registrations
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Registration not found'
            });
        }

        res.status(200).json({
            message: 'Registration cancelled successfully',
            registration: result.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// =====================================
// START SERVER
// =====================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
