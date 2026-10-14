const express = require('express'); // Import the Express framework
const router = express.Router(); // Create a new router object to define routes
const path = require('path'); // Import the path module for handling file paths
const connectDB = require('../config/dbConn');
const mongoose = require('mongoose');

router.get('/health', async (req, res) => {
    try {
        await connectDB();
        res.json({ database: mongoose.connection.readyState === 1 ? 'ON' : 'OFF' });
    } catch (error) {
        console.error('MongoDB status check failed:', error);
        res.status(503).json({ database: 'OFF' });
    }
});

router.get(['/', '/index', '/index.html'], (req, res) => { // Define a GET route for the root path and its variations ('/index' and '/index.html')
    res.sendFile('index.html', { root: path.join(__dirname, '..', 'views') });
});

module.exports = router; // Export the router object so it can be used in other parts of the application