const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql2");

const app = express();

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Tejisingh_420.com',
    database: 'crowdfundings_db'
});

// Middleware to parse URL-encoded & JSON data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(__dirname));

// Route to serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Route to serve fundraiser.html
app.get("/fundraiser", (req, res) => {
    res.sendFile(path.join(__dirname, "fundraiser.html"));
});

// Route to serve categories.html
app.get("/categories", (req, res) => {
    res.sendFile(path.join(__dirname, "categories.html"));
});

// Route to serve search.html
app.get("/search", (req, res) => {
    res.sendFile(path.join(__dirname, "search.html"));
});

// 1. GET method to retrieve all active fundraisers including the category
app.get("/api/home", (req, res) => {
    const sql = `
        SELECT F.*, C.name AS category_name
        FROM fundraiser F
        JOIN category C ON F.category_id = C.category_id
        WHERE F.is_active = 1
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching fundraisers:", err);
            return res.status(500).json({ message: "Error fetching fundraisers" });
        }
        res.json(results);
    });
});

// 2. GET method to retrieve all categories
app.get("/api/categories", (req, res) => {
    const sql = 'SELECT * FROM category';
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching categories:", err);
            return res.status(500).json({ message: "Error fetching categories" });
        }
        res.json(results);
    });
});

// 3. GET method to retrieve active fundraisers based on category criteria
app.get("/api/search", (req, res) => {
    const { categoryId } = req.query;
    const sql = `
        SELECT F.*, C.name AS category_name
        FROM fundraiser F
        JOIN category C ON F.category_id = C.category_id
        WHERE F.is_active = 1 AND (C.category_id = ? OR ? IS NULL)
    `;
    db.query(sql, [categoryId, categoryId], (err, results) => {
        if (err) {
            console.error("Error fetching fundraisers:", err);
            return res.status(500).json({ message: "Error fetching fundraisers" });
        }
        res.json(results);
    });
});

// 4. GET method to retrieve the details of a fundraiser by ID
app.get("/api/fundraiser/:id", (req, res) => {
    const fundraiserId = req.params.id;
    const sql = 'SELECT * FROM fundraiser WHERE fundraiser_id = ?';
    db.query(sql, [fundraiserId], (err, result) => {
        if (err) {
            console.error("Error fetching fundraiser:", err);
            return res.status(500).json({ message: "Error fetching fundraiser" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Fundraiser not found' });
        }
        res.json(result[0]);
    });
});

// Start the server
app.listen(8080, () => {
    console.log("Server running on port 8080");
});
