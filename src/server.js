const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
dotenv.config();

const app = express();
const port = process.env.PORT || 5000
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';


app.use(bodyParser.json());
app.use(cors({origin: 'http://localhost:3000'}))

// Database connection pool
const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});


const createDatabaseAndTables = async () => {
    const connection = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await connection.query(`USE \`${DB_NAME}\`;`);

    console.log(`Using the database ${DB_NAME}`);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS farmers (
            farmerID INT AUTO_INCREMENT PRIMARY KEY,
            farmerName VARCHAR(255) NOT NULL,
            profileImageURL VARCHAR(2048),
            phonenumber VARCHAR(255) UNIQUE,
            password VARCHAR(255) NOT NULL,
            location VARCHAR(255)
        )
    `);
    console.log('Created/Checked the farmers table.');

    await connection.query(`
        CREATE TABLE IF NOT EXISTS vendors (
            vendorID INT AUTO_INCREMENT PRIMARY KEY,
            vendorName VARCHAR(255) NOT NULL,
            profileImageURL VARCHAR(2048),
            phonenumber VARCHAR(255) UNIQUE,
            password VARCHAR(255) NOT NULL
        )
    `);
    console.log('Created/Checked the consumers table.')

    await connection.query(`
        CREATE TABLE IF NOT EXISTS products (
            productID INT AUTO_INCREMENT PRIMARY KEY,
            productName VARCHAR(255) NOT NULL,
            vendorID INT,
            productPrice INT NOT NULL,
            category VARCHAR(255),
            stock INT,
            imageURL VARCHAR(2048),
            recommended BOOLEAN DEFAULT FALSE,
            FOREIGN KEY(vendorID) REFERENCES vendors(vendorID)
        )
    `);
    console.log('Created/Checked the products table.')

    await connection.query(`
        CREATE TABLE IF NOT EXISTS jobSeekers (
            jobSeekerID INT AUTO_INCREMENT PRIMARY KEY,
            jobSeekerName VARCHAR(255) NOT NULL,
            profileImageURL VARCHAR(2048),
            phonenumber VARCHAR(255) UNIQUE,
            password VARCHAR(255) NOT NULL,
            location VARCHAR(255),
            available BOOLEAN DEFAULT FALSE

        )
    `);
    console.log('Created/Checked the jobseekers table.')

    await connection.query(`
        CREATE TABLE IF NOT EXISTS orders (
            orderID INT AUTO_INCREMENT PRIMARY KEY,
            products VARCHAR(255) NOT NULL,
            vendorID INT,
            farmerID INT,
            jobSeekerID INT,
            FOREIGN KEY(vendorID) REFERENCES vendors(vendorID),
            FOREIGN KEY(farmerID) REFERENCES farmers(farmerID),
            FOREIGN KEY(jobSeekerID) REFERENCES jobSeekers(jobSeekerID)
        )
    `);
    console.log('Created/Checked the orders table.')

    await connection.end();
};

createDatabaseAndTables();

app.post('/api/login', async (req, res) => {
    const { phonenumber, password, role } = req.body;

    try {
        const connection = await pool.getConnection();
        let query = '';
        let roleTable = '';

        // Determine which table to query based on the role
        if (role === 'farmer') {
            roleTable = 'farmers';
        } else if (role === 'vendor') {
            roleTable = 'vendors';
        } else if (role === 'jobSeeker') {
            roleTable = 'jobSeekers';
        } else {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        // Query the respective table for login
        query = `SELECT * FROM ${roleTable} WHERE phonenumber = ? AND password = ?`;
        const [rows] = await connection.query(query, [phonenumber, password]);
        connection.release();

        if (rows.length > 0) {
            res.status(200).json({
                message: "Login successful",
                user: rows[0],
                role: role,
            });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.post('/api/register', async (req, res) => {
    const { phonenumber, role, fullnames, location, password } = req.body;

    try {
        const connection = await pool.getConnection();
        let query = '';

        // Determine which table to insert into based on the role
        if (role === 'farmer') {
            query = `INSERT INTO farmers (farmerName, phonenumber, password, location) VALUES (?, ?, ?, ?)`;
            await connection.query(query, [fullnames, phonenumber, password, location]);
        } else if (role === 'vendor') {
            query = `INSERT INTO vendors (vendorName, phonenumber, password) VALUES (?, ?, ?)`;
            await connection.query(query, [fullnames, phonenumber, password]);
        } else if (role === 'jobSeeker') {
            query = `INSERT INTO jobSeekers (jobSeekerName, phonenumber, password) VALUES (?, ?, ?)`;
            await connection.query(query, [fullnames, phonenumber, password]);
        } else {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        connection.release();

        res.status(201).json({ message: "User registered successfully", role: role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.post('/api/products', async (req, res) => {
    const { name, image, stock, price, recommended, category, vendorID } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query(
            `INSERT INTO products (productName, imageURL, stock, productPrice, recommended, category, vendorID)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, image, stock, price, recommended, category, vendorID]
        );
        connection.release();

        res.status(201).json({ message: "Product added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/products/:productID', async (req, res) => {
    const { productID } = req.params;

    try {
        const connection = await pool.getConnection();
        await connection.query(`DELETE FROM products WHERE productID = ?`, [productID]);
        connection.release();

        res.status(200).json({ message: "Product removed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/products/:productID', async (req, res) => {
    const { productID } = req.params;
    const { name, price, category, recommended } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query(
            `UPDATE products SET 
             productName = COALESCE(?, productName),
             productPrice = COALESCE(?, productPrice),
             category = COALESCE(?, category),
             recommended = COALESCE(?, recommended)
             WHERE productID = ?`,
            [name, price, category, recommended, productID]
        );
        connection.release();

        res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(`
            SELECT * FROM orders
        `);
        connection.release();

        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const { products, vendorID, farmerID, jobSeekerID } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query(
            `INSERT INTO orders (products, vendorID, farmerID, jobSeekerID) VALUES (?, ?, ?, ?)`,
            [JSON.stringify(products), vendorID, farmerID, jobSeekerID]
        );
        connection.release();

        res.status(201).json({ message: "Order added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/orders/:orderID', async (req, res) => {
    const { orderID } = req.params;
    const { products, vendorID, farmerID, jobSeekerID } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query(
            `UPDATE orders SET 
             products = COALESCE(?, products),
             vendorID = COALESCE(?, vendorID),
             farmerID = COALESCE(?, farmerID),
             jobSeekerID = COALESCE(?, jobSeekerID)
             WHERE orderID = ?`,
            [JSON.stringify(products), vendorID, farmerID, jobSeekerID, orderID]
        );
        connection.release();

        res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to fetch all job seekers
app.get('/api/job-seekers', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM jobSeekers');
        connection.release();

        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to fetch a single job seeker by ID
app.get('/api/job-seekers/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM jobSeekers WHERE jobSeekerID = ?', [id]);
        connection.release();

        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Job seeker not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to add a new job seeker
app.post('/api/job-seekers', async (req, res) => {
    const { jobSeekerName, profileImageURL, phonenumber, password, location, available } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO jobSeekers (jobSeekerName, profileImageURL, phonenumber, password, location, available) VALUES (?, ?, ?, ?, ?, ?)',
            [jobSeekerName, profileImageURL, phonenumber, password, location, available]
        );
        connection.release();

        res.status(201).json({ message: 'Job seeker added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to update an existing job seeker
app.patch('/api/job-seekers/:id', async (req, res) => {
    const { id } = req.params;
    const { jobSeekerName, profileImageURL, phonenumber, location, available } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query(
            `UPDATE jobSeekers SET 
             jobSeekerName = COALESCE(?, jobSeekerName),
             profileImageURL = COALESCE(?, profileImageURL),
             phonenumber = COALESCE(?, phonenumber),
             location = COALESCE(?, location),
             available = COALESCE(?, available)
             WHERE jobSeekerID = ?`,
            [jobSeekerName, profileImageURL, phonenumber, location, available, id]
        );
        connection.release();

        res.status(200).json({ message: 'Job seeker updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to delete a job seeker
// app.delete('/api/job-seekers/:id', async (req, res) => {
//     const { id } = req.params;

//     try {
//         const connection = await pool.getConnection();
//         await connection.query('DELETE FROM jobSeekers WHERE jobSeekerID = ?', [id]);
//         connection.release();

//         res.status(200).json({ message: 'Job seeker deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });


app.post('/api/reset-password', async (req, res) => {
    const { phonenumber } = req.body;

    try {
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate OTP
        // Save OTP in memory or database
        // Send OTP via SMS/Email (use a service like Twilio or SendGrid)

        res.status(200).json({ message: "OTP sent successfully", otp }); // OTP for testing
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/verify-otp', async (req, res) => {
    const { phonenumber, otp, newPassword } = req.body;

    try {
        // Verify OTP logic here

        const connection = await pool.getConnection();
        await connection.query(
            `UPDATE farmers SET password = ? WHERE phonenumber = ? UNION
             UPDATE vendors SET password = ? WHERE phonenumber = ? UNION
             UPDATE jobSeekers SET password = ? WHERE phonenumber = ?`,
            [newPassword, phonenumber, newPassword, phonenumber, newPassword, phonenumber]
        );
        connection.release();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.listen(port, ()=>{
    console.log(`Server is listening in port ${port}`);
})