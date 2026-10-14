require('dotenv').config() // Load environment variables from a .env file into process.env
const express = require('express'); // Import the Express framework
const app = express(); // Create an instance of the Express application
const path = require('path'); // Import the path module for handling file paths
const { logger, logEvents } = require('./middleware/logger'); // Import the logger middleware and logEvents function from the 'middleware/logger.js' file
const { errorHandler } = require('./middleware/errorHandler'); // Import the errorHandler middleware from the 'middleware/errorHandler.js' file
const cookieParser = require('cookie-parser'); // Import the cookie-parser middleware for parsing cookies
const cors = require('cors'); // Import the CORS middleware for handling Cross-Origin Resource Sharing
const corsOptions = require('./config/corsOptions'); // Import the CORS options from the 'config/corsOptions.js' file
const connectDB = require('./config/dbConn'); // Import the database connection function from the 'config/dbConn.js' file
const mongoose = require('mongoose'); // Import the Mongoose library for MongoDB interactions
const PORT = process.env.PORT || 5000; // Set the port to the environment variable PORT or default to 5000

console.log(process.env.NODE_ENV); // Log the current environment (development, production, etc.) to the console

connectDB(); // Call the function to connect to the MongoDB database

app.use(logger); // Use the logger middleware for all incoming requests

app.use(cors(corsOptions)); // Use the CORS middleware with the specified options

app.use(express.json()); // Middleware to parse JSON request bodies

app.use(cookieParser()); // Use the cookie-parser middleware for parsing cookies

app.use('/' ,express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

app.use('/',require('./routes/root')); // Use the routes defined in 'routes/root.js' for the root path
app.use('/auth', require('./routes/authRoutes')); // Use the routes defined in 'routes/authRoutes.js' for the '/auth' path
app.use('/users', require('./routes/userRoutes')); // Use the routes defined in 'routes/userRoutes.js' for the '/users' path
app.use('/notes' , require('./routes/noteRoutes')); // Use the routes defined in 'routes/noteRoutes.js' for the '/notes' path

app.use((req, res) => { // Middleware to handle 404 errors for any unmatched routes
    res.status(404);
    if(req.accepts('html')) {
        res.sendFile('404.html', { root: path.join(__dirname, 'views') }); 
    } else if(req.accepts('json')) {
        res.json({ error: '404 Not Found' });
    } else {
        res.type('txt').send('404 Not Found');
    }
});

app.use(errorHandler); // Use the error handler middleware for handling errors

mongoose.connection.once('open', () => { // Listen for the 'open' event on the Mongoose connection
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`) ); // Start the server and listen on the specified port, logging a message when the server is running
});

mongoose.connection.on('error', err => { // Listen for the 'error' event on the Mongoose connection
    console.error(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log'); // Log the error details to a file named 'mongoErrLog.log'
});