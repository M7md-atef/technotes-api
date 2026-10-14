const { format } = require('date-fns'); // Import the format function from the date-fns library for formatting dates
const { v4: uuid } = require('uuid'); // Import the v4 function from the uuid library for generating unique identifiers
const fs = require('fs'); // Import the fs module for file system operations
const fsPromises = require('fs').promises; // Import the promises API from the fs module for asynchronous file operations
const path = require('path'); // Import the path module for handling file paths

const logEvents = async (message, logFileName) => { // Define an asynchronous function to log events
    const dateTime = `${format(new Date(), 'yyyy-MM-dd\tHH:mm:ss')}`; // Format the current date and time
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`; // Create a log entry with the date, unique ID, and message

    if (process.env.VERCEL) {
        console.log(logItem.trimEnd());
        return;
    }

    try { // Try to append the log entry to the specified log file
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) { // Check if the 'logs' directory exists
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs')); // Create the 'logs' directory if it doesn't exist
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem); // Append the log entry to the specified log file
    } catch (err) {
        console.error('Error occurred while logging event:', err);
    }
};

const logger = (req, res, next) => { // Define a middleware function to log incoming requests
    if (!process.env.VERCEL) {
        logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.log'); // Log the HTTP method, request origin, and URL to 'reqLog.log'
    }
    console.log(`${req.method} ${req.path}`); // Log the HTTP method and request path to the console
    next(); // Call the next middleware function in the stack
};

module.exports = { logger, logEvents }; // Export the logger middleware and logEvents function for use in other parts of the application