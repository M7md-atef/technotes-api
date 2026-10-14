const mongoose = require('mongoose'); // Import the Mongoose library for MongoDB interactions

let connectionPromise;

const connectDB = () => {
    if (mongoose.connection.readyState === 1) {
        return Promise.resolve(mongoose.connection);
    }

    if (!process.env.DATABASE_URL) {
        return Promise.reject(new Error('DATABASE_URL environment variable is required'));
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.DATABASE_URL)
            .then(() => mongoose.connection)
            .catch(error => {
                connectionPromise = null;
                throw error;
            });
    }

    return connectionPromise;
};

module.exports = connectDB;
