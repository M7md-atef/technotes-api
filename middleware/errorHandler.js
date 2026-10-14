const { logEvents } = require('./logger'); // Import the logEvents function from the logger module

const errorHandler = (err, req, res, next) => { // Define an error-handling middleware function
    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.headers.origin}\t${req.url}`, 'errorLog.log'); // Log the error name and message to 'errorLog.log'
    console.error(err.stack); // Log the error stack trace to the console

    const status = res.statusCode >= 400 ? res.statusCode : 500; // Default unhandled errors to 500
    
    res.status(status); // Set the response status code

    res.json({ // Send a JSON response with the error details
        message: err.message, // Include the error message
        isError: true, // Indicate that this is an error response
    });
}

module.exports = { errorHandler }; // Export the errorHandler middleware for use in other parts of the application