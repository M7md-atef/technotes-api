const allowedOrigins = require('./allowedOrigin'); // Import the allowedOrigins array from the 'allowedOrigin.js' file

const corsOptions = {
    origin: (origin, callback) => { // Define a function to check if the request origin is allowed
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) { // Check if the origin is in the allowedOrigins array or if there is no origin (e.g., for same-origin requests)
            callback(null, true); // If the origin is allowed, call the callback with no error and allow the request
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow credentials (cookies, authorization headers, etc.) to be included in cross-origin requests
    optionsSuccessStatus: 200 // Set the status code for successful OPTIONS requests to 200 (OK)
};

module.exports = corsOptions;