const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 3001;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

app.use(express.json());

app.get('/requests_form', async(req, res) => {
    try{
        const result = await pool.query('SELECT * FROM public.service_request_form');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});