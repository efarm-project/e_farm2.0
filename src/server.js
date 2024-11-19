const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require('multer');
const path = require('path');
dotenv.config();

const app = express();
const port = process.env.PORT || 5000
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';


// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/'); // Folder to store uploaded images
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Generate unique file names
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, and PNG file types are allowed.'));
    }
  },
});

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user information to the request
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token." });
    }
};




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
            order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved BOOLEAN DEFAULT FALSE,
            FOREIGN KEY(vendorID) REFERENCES vendors(vendorID),
            FOREIGN KEY(farmerID) REFERENCES farmers(farmerID),
            FOREIGN KEY(jobSeekerID) REFERENCES jobSeekers(jobSeekerID)
        )
    `);
    console.log('Created/Checked the orders table.')

    await connection.query(`
        CREATE TABLE IF NOT EXISTS cart (
            cartID INT AUTO_INCREMENT PRIMARY KEY,
            userID INT NOT NULL,
            productID INT NOT NULL,
            vendorID INT NOT NULL,
            quantity INT NOT NULL,
            FOREIGN KEY (userID) REFERENCES farmers(farmerID),
            FOREIGN KEY (productID) REFERENCES products(productID),
            FOREIGN KEY (vendorID) REFERENCES vendors(vendorID)
        )
    `);
    console.log('Created/Checked the farmers cart table.');
    await connection.query(`
        CREATE TABLE IF NOT EXISTS worker_cart (
            cartID INT AUTO_INCREMENT PRIMARY KEY,
            userID INT NOT NULL,
            productID INT NOT NULL,
            vendorID INT NOT NULL,
            quantity INT NOT NULL,
            FOREIGN KEY (userID) REFERENCES jobseekers(jobseekerID),
            FOREIGN KEY (productID) REFERENCES products(productID),
            FOREIGN KEY (vendorID) REFERENCES vendors(vendorID)
        )
    `);
    console.log('Created/Checked the workers cart table.');
    

    await connection.end();
};

createDatabaseAndTables();



app.post('/api/login', async (req, res) => {
    const { phonenumber, password, role } = req.body;

    try {
        const connection = await pool.getConnection();
        let query = '';
        let roleTable = '';

        if (role === 'farmer') {
            roleTable = 'farmers';
        } else if (role === 'vendor') {
            roleTable = 'vendors';
        } else if (role === 'jobSeeker') {
            roleTable = 'jobSeekers';
        } else {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        query = `SELECT * FROM ${roleTable} WHERE phonenumber = ?`;
        const [rows] = await connection.query(query, [phonenumber]);
        connection.release();

        if (rows.length > 0) {
            const user = rows[0];
            const isMatch = await bcrypt.compare(password, user.password); // Compare hashed password

            if (isMatch) {
                const token = jwt.sign(
                    {
                        id: user[`${role}ID`],
                        role: role,
                    },
                    JWT_SECRET,
                    { expiresIn: "1h" }
                );

                res.status(200).json({
                    message: "Login successful",
                    user: {
                        id: user[`${role}ID`],
                        name: user[`${role}Name`],
                        role: role,
                    },
                    token: token,
                });
            } else {
                res.status(401).json({ message: "Invalid credentials" });
            }
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
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password
        let query = '';

        if (role === 'farmer') {
            query = `INSERT INTO farmers (farmerName, phonenumber, password, location) VALUES (?, ?, ?, ?)`;
            await connection.query(query, [fullnames, phonenumber, hashedPassword, location]);
        } else if (role === 'vendor') {
            query = `INSERT INTO vendors (vendorName, phonenumber, password) VALUES (?, ?, ?)`;
            await connection.query(query, [fullnames, phonenumber, hashedPassword]);
        } else if (role === 'jobseeker') {
            query = `INSERT INTO jobSeekers (jobSeekerName, phonenumber, password) VALUES (?, ?, ?)`;
            await connection.query(query, [fullnames, phonenumber, hashedPassword]);
        } else {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        connection.release();

        res.status(201).json({ message: "User registered successfully", role: role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/user-profile', verifyToken, async (req, res) => {
    try {
        const { id, role } = req.user; // Extract id and role from the token payload

        let query = '';
        let table = '';

        if (role === 'farmer') {
            table = 'farmers';
            query = `SELECT farmerID AS id, farmerName AS name, phonenumber, location, profileImageURL FROM ${table} WHERE farmerID = ?`;
        } else if (role === 'vendor') {
            table = 'vendors';
            query = `SELECT vendorID AS id, vendorName AS name, phonenumber, profileImageURL FROM ${table} WHERE vendorID = ?`;
        } else if (role === 'jobSeeker') {
            table = 'jobSeekers';
            query = `SELECT jobSeekerID AS id, jobSeekerName AS name, phonenumber, location, profileImageURL FROM ${table} WHERE jobSeekerID = ?`;
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const connection = await pool.getConnection();
        const [rows] = await connection.query(query, [id]);
        connection.release();

        if (rows.length > 0) {
            res.status(200).json({ ...rows[0], role }); // Include role in the response
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        res.status(500).json({ error: error.message });
    }
});


app.patch('/api/user-profile', verifyToken, async (req, res) => {
    const { id, role } = req.user;
    const { name, phonenumber, location, profileImageURL } = req.body;

    try {
        let query = '';
        let table = '';

        if (role === 'farmer') {
            table = 'farmers';
            query = `UPDATE ${table} SET 
                        farmerName = COALESCE(?, farmerName), 
                        phonenumber = COALESCE(?, phonenumber), 
                        location = COALESCE(?, location), 
                        profileImageURL = COALESCE(?, profileImageURL) 
                     WHERE farmerID = ?`;
        } else if (role === 'vendor') {
            table = 'vendors';
            query = `UPDATE ${table} SET 
                        vendorName = COALESCE(?, vendorName), 
                        phonenumber = COALESCE(?, phonenumber), 
                        profileImageURL = COALESCE(?, profileImageURL) 
                     WHERE vendorID = ?`;
        } else if (role === 'jobSeeker') {
            table = 'jobSeekers';
            query = `UPDATE ${table} SET 
                        jobSeekerName = COALESCE(?, jobSeekerName), 
                        phonenumber = COALESCE(?, phonenumber), 
                        location = COALESCE(?, location), 
                        profileImageURL = COALESCE(?, profileImageURL) 
                     WHERE jobSeekerID = ?`;
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const connection = await pool.getConnection();
        await connection.query(query, [name, phonenumber, location, profileImageURL, id]);
        connection.release();

        res.status(200).json({ message: 'Profile updated successfully.' });
    } catch (error) {
        console.error('Error updating user profile:', error.message);
        res.status(500).json({ error: error.message });
    }
});



// Fetch products with vendor details and pagination
app.get('/api/products', async (req, res) => {
    const { page = 1, limit = 10, category } = req.query;
    const offset = (page - 1) * limit;
  
    try {
      const connection = await pool.getConnection();
  
      // Build the query with optional category filter
      let query = `
        SELECT 
          p.productID, 
          p.productName, 
          p.productPrice, 
          p.category, 
          p.stock, 
          p.imageURL, 
          p.recommended, 
          v.vendorName 
        FROM products p
        LEFT JOIN vendors v ON p.vendorID = v.vendorID
      `;
      const params = [];
  
      if (category) {
        query += ` WHERE p.category = ?`;
        params.push(category);
      }
  
      query += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), parseInt(offset));
  
      console.log("SQL Query:", query);
      console.log("Params:", params);
  
      // Execute the query
      const [products] = await connection.query(query, params);
  
      // Count total products for pagination
      const countQuery = `
        SELECT COUNT(*) as total FROM products
        ${category ? "WHERE category = ?" : ""}
      `;
      const countParams = category ? [category] : [];
      const [[{ total }]] = await connection.query(countQuery, countParams);
  
      connection.release();
  
      res.status(200).json({
        products,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error in /api/products:", error.message);
      res.status(500).json({ error: error.message });
    }
  });


  
  // Route to handle adding products
  app.post('/api/products', upload.single('image'), async (req, res) => {
    const {
      name,
      stock,
      price,
      recommended,
      category,
      vendorID,
      imageURL,
    } = req.body;
  
    let imagePath = imageURL; // Use the URL if provided
  
    if (req.file) {
      // Use the uploaded file if an image file was uploaded
      imagePath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }
  
    try {
      const connection = await pool.getConnection();
      await connection.query(
        `INSERT INTO products (productName, imageURL, stock, productPrice, recommended, category, vendorID)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, imagePath, stock, price, recommended === 'true', category, vendorID]
      );
      connection.release();
  
      res.status(201).json({ message: 'Product added successfully' });
    } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Serve static files from the uploads folder
  app.use('/uploads', express.static('uploads'));
  app.get('/api/vendor-products', verifyToken, async (req, res) => {
    try {
      // Ensure only vendors can access this route
      if (req.user.role !== 'vendor') {
        return res.status(403).json({ message: 'Access denied. Only vendors can access this endpoint.' });
      }
  
      const connection = await pool.getConnection();
      const [products] = await connection.query(
        `SELECT productID, productName, productPrice, stock, category, imageURL, recommended 
         FROM products 
         WHERE vendorID = ?`,
        [req.user.id] // Use the vendorID of the logged-in vendor
      );
      connection.release();
  
      res.status(200).json({ products });
    } catch (error) {
      console.error('Error retrieving vendor products:', error.message);
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
app.post('/api/cart', verifyToken, async (req, res) => {
    const { productID, quantity } = req.body;

    try {
        const connection = await pool.getConnection();

        // Fetch vendorID from the product
        const [product] = await connection.query(
            `SELECT vendorID FROM products WHERE productID = ?`,
            [productID]
        );

        if (!product.length) {
            connection.release();
            return res.status(404).json({ message: "Product not found." });
        }

        const vendorID = product[0].vendorID;

        if (req.user.role === 'farmer') {
            // Insert or update farmer's cart
            await connection.query(
                `INSERT INTO cart (userID, productID, vendorID, quantity) 
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
                [req.user.id, productID, vendorID, quantity, quantity]
            );
        } else if (req.user.role === 'jobseeker') {
            // Insert or update worker's cart
            await connection.query(
                `INSERT INTO worker_cart (userID, productID, vendorID, quantity) 
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
                [req.user.id, productID, vendorID, quantity, quantity]
            );
        } else {
            connection.release();
            return res.status(403).json({ message: "Only farmers and workers can add to the cart." });
        }

        connection.release();
        res.status(201).json({ message: "Product added to cart successfully." });
    } catch (error) {
        console.error("Error in adding to cart:", error.message);
        res.status(500).json({ error: error.message });
    }
});




app.get('/api/farmer_cart', verifyToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT c.cartID, c.quantity, p.productName, p.productPrice, p.stock, v.vendorName
             FROM cart c
             JOIN products p ON c.productID = p.productID
             JOIN vendors v ON c.vendorID = v.vendorID
             WHERE c.userID = ?`,
            [req.user.id]
        );
        connection.release();
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching cart:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/worker-cart', verifyToken, async (req, res) => {
    if (req.user.role !== 'jobSeeker') {
        return res.status(403).json({ message: "Access denied. Only workers can access this endpoint." });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT wc.cartID, wc.quantity, p.productName, p.productPrice, v.vendorName
             FROM worker_cart wc
             JOIN products p ON wc.productID = p.productID
             JOIN vendors v ON wc.vendorID = v.vendorID
             WHERE wc.workerID = ?`,
            [req.user.id]
        );
        connection.release();
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching worker cart:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/cart/:cartID', verifyToken, async (req, res) => {
    const { cartID } = req.params;

    try {
        const connection = await pool.getConnection();

        if (req.user.role === 'farmer') {
            // Delete from farmer's cart
            await connection.query(
                `DELETE FROM cart WHERE cartID = ? AND userID = ?`,
                [cartID, req.user.id]
            );
        } else if (req.user.role === 'jobseeker') {
            // Delete from worker's cart
            await connection.query(
                `DELETE FROM worker_cart WHERE cartID = ? AND userID = ?`,
                [cartID, req.user.id]
            );
        } else {
            connection.release();
            return res.status(403).json({ message: "Only farmers or workers can delete items from the cart." });
        }

        connection.release();
        res.status(200).json({ message: "Item removed from the cart successfully." });
    } catch (error) {
        console.error("Error removing item from cart:", error.message);
        res.status(500).json({ error: error.message });
    }
});



app.get('/api/orders', verifyToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT orderID, products, vendorID, farmerID, jobSeekerID, order_time, resolved
             FROM orders
             WHERE farmerID = ?`,
            [req.user.id]
        );
        connection.release();

        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.post('/api/orders', verifyToken, async (req, res) => {
    const { products, vendorID, farmerID, jobSeekerID } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query(
            `INSERT INTO orders (products, vendorID, farmerID, jobSeekerID, resolved)
             VALUES (?, ?, ?, ?, ?)`,
            [JSON.stringify(products), vendorID, farmerID, jobSeekerID, false] // Resolved defaults to false
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

app.get('/api/vendor-notifications', verifyToken, async (req, res) => {
    if (req.user.role !== 'vendor') {
        return res.status(403).json({ message: "Access denied. Only vendors can access this." });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT o.orderID, o.products, o.order_time, f.farmerName 
             FROM orders o 
             JOIN farmers f ON o.farmerID = f.farmerID 
             WHERE o.vendorID = ? AND o.order_time > ? AND o.resolved = FALSE`,
            [req.user.id, req.user.lastLogin]
        );
        connection.release();
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching notifications:", error.message);
        res.status(500).json({ error: error.message });
    }
});


app.delete('/api/mark-notification/:orderID', verifyToken, async (req, res) => {
    const { orderID } = req.params;

    if (req.user.role !== 'vendor') {
        return res.status(403).json({ message: "Access denied. Only vendors can mark notifications." });
    }

    try {
        const connection = await pool.getConnection();
        await connection.query(`UPDATE orders SET resolved = TRUE WHERE orderID = ? AND vendorID = ?`, [
            orderID,
            req.user.id,
        ]);
        connection.release();
        res.status(200).json({ message: "Notification marked as read." });
    } catch (error) {
        console.error("Error marking notification as read:", error.message);
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
        const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash new password

        const connection = await pool.getConnection();
        await connection.query(
            `UPDATE farmers SET password = ? WHERE phonenumber = ? UNION
             UPDATE vendors SET password = ? WHERE phonenumber = ? UNION
             UPDATE jobSeekers SET password = ? WHERE phonenumber = ?`,
            [hashedPassword, phonenumber, hashedPassword, phonenumber, hashedPassword, phonenumber]
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