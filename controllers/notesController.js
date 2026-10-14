const User = require('../models/User'); // Import the User model from the models directory
const Note = require('../models/Note'); // Import the Note model from the models directory
const asyncHandler = require('express-async-handler'); // Import the express-async-handler middleware for handling asynchronous route handlers

//@desc Get all notes
//@route GET /notes
//@access Private
const getAllNotes = asyncHandler(async (req, res) => { // Define an asynchronous function to get all notes
    const notes = await Note.find().lean(); // Fetch all notes from the database and return a lean object
    if(!notes?.length) { // Check if there are no notes found
        return res.status(400).json({ message: 'No notes found' }); // Return a 400 status code with a message if no notes are found
    }

    // Add username to each note before sending the response 
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return { ...note, username: user.username }
    }))

    res.status(200).json(notesWithUser)
});

//@desc Create a new note
//@route POST /notes
//@access Private
const createNewNote = asyncHandler(async (req, res) => { // Define an asynchronous function to create a new note
    const { user, title, text } = req.body; // Destructure the title and text from the request body

    // Confirm data
    if(!user || !title || !text) { // Check if any required fields are missing
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec(); // Check if a note with the same title already exists in the database
    if(duplicate) { // If a duplicate note is found
        return res.status(409).json({ message: 'Duplicate title' }); // Return a 409 status code with a message indicating a duplicate title
    }

    // Create note
    const note = await Note.create({ // Create a new note in the database
        user,
        title,
        text
    });

    if(note) { // If the note was created successfully
        return res.status(201).json({ message: 'New note created' }); // Return a 201 status code with a success message
    } else {
        return res.status(400).json({ message: 'Invalid note data received' }); // Return a 400 status code with an error message
    }
});

//@desc Update a note
//@route PATCH /notes
//@access Private
const updateNote = asyncHandler(async (req, res) => { // Define an asynchronous function to update note information
    const { id, user, title, text, completed } = req.body; // Destructure the id, user, title, text, and completed status from the request body

    // Confirm data
    if(!id || !user || !title || !text || typeof completed !== 'boolean') { // Check if any required fields are missing or invalid
        return res.status(400).json({ message: 'All fields are required' }); // Return a 400 status code with a message indicating that all fields are required
    }

    // Confirm note exists to update
    const note = await Note.findById(id).exec(); // Find the note by ID in the database

    if(!note) { // If the note is not found
        return res.status(400).json({ message: 'Note not found' }); // Return a 400 status code with a message indicating that the note was not found
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec(); // Check if a note with the same title already exists in the database
    //Allow updates to the original note
    if(duplicate && duplicate?._id.toString() !== id) { // If a duplicate note is found and it's not the same note being updated
        return res.status(409).json({ message: 'Duplicate title' }); // Return a 409 status code with a message indicating a duplicate title
    }

    note.user = user; // Update the note's user
    note.title = title; // Update the note's title
    note.text = text; // Update the note's text
    note.completed = completed; // Update the note's completed status

    const updatedNote = await note.save(); // Save the updated note information to the database
    return res.status(200).json({ message: 'Note updated successfully' });
});

//@desc Delete a note
//@route DELETE /notes
//@access Private
const deleteNote = asyncHandler(async (req, res) => { // Define an asynchronous function to delete a note
    const { id } = req.body; // Destructure the id from the request body

    // Confirm data
    if(!id) { // Check if the id is not provided
        return res.status(400).json({ message: 'Note ID required' }); // Return a 400 status code with a message indicating that the note ID is required
    }

    // Confirm note exists to delete
    const note = await Note.findById(id).exec(); // Find the note by ID in the database
    if(!note) { // If the note is not found
        return res.status(404).json({ message: 'Note not found' }); // Return a 404 status code with a message indicating that the note was not found
    }

    const result = await note.deleteOne(); // Delete the note from the database
    if(!result) { // If the note was not deleted
        return res.status(500).json({ message: 'Failed to delete note' }); // Return a 500 status code with a message indicating failure to delete the note
    }
    return res.status(200).json({ message: `Note with ID ${id} deleted successfully` }); // Return a 200 status code with a message indicating successful deletion
});

module.exports = { // Export the defined functions so they can be used in other parts of the application
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
};