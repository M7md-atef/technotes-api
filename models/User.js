const mongoose = require('mongoose'); // Import the Mongoose library for MongoDB interactions

const userSchema = new mongoose.Schema({ // Define a new Mongoose schema for the User model
    username: { // Define the 'username' field in the schema
        type: String, // The data type for 'username' is String
        required: true, // The 'username' field is required
    },
    roles: { // Define the 'roles' field in the schema
        type: [String], // The data type for 'roles' is an array of strings
        default: ["Employee"] // The default value for 'roles' is an array containing "Employee"
    },
    active: { // Define the 'active' field in the schema
        type: Boolean, // The data type for 'active' is Boolean
        default: true // The default value for 'active' is true
    },
    password: { // Define the 'password' field in the schema
        type: String, // The data type for 'password' is String
        required: true // The 'password' field is required
    }
});

module.exports = mongoose.model('User', userSchema); // Export the User model based on the defined schema