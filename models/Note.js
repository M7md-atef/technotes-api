const mongoose = require('mongoose'); // Import the Mongoose library for MongoDB interactions
const AutoIncrement = require('mongoose-sequence')(mongoose); // Import the mongoose-sequence plugin for auto-incrementing fields

const noteSchema = new mongoose.Schema( // Define a new Mongoose schema for the Note model
    {
        user: { // Define the 'user' field in the schema
            type: mongoose.Schema.Types.ObjectId, // The data type for 'user' is a MongoDB ObjectId
            ref: 'User', // Reference to the User model
            required: true, // The 'user' field is required
        },
        title: { // Define the 'title' field in the schema
            type: String, // The data type for 'title' is String
            required: true // The 'title' field is required
        },
        text: { // Define the 'text' field in the schema
            type: String, // The data type for 'text' is String
            required: true // The 'text' field is required
        },
        completed: { // Define the 'completed' field in the schema
            type: Boolean, // The data type for 'completed' is Boolean
            default: false // The default value for 'completed' is false
        },
    },
    {
        timestamps: true // Automatically add 'createdAt' and 'updatedAt' fields to the schema
    }
);

noteSchema.plugin(AutoIncrement, { // Apply the auto-increment plugin to the noteSchema, incrementing the 'noteId' field
    inc_field: 'ticket',
    id: 'ticketNums', // Name of the counter collection 
    start_seq: 500 // Starting sequence number for the auto-increment
}); 

module.exports = mongoose.model('Note', noteSchema); // Export the Note model based on the defined schema