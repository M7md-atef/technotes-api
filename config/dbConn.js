const mongoose = require('mongoose'); // Import the Mongoose library for MongoDB interactions

const connectDB = async () => { // Define an asynchronous function to connect to the MongoDB database
    try {
        await mongoose.connect(process.env.DATABASE_URL); // Attempt to connect to the database using the URL from environment variables
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

module.exports = connectDB;