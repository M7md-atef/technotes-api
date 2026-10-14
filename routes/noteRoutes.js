const express = require('express'); // Import the Express framework
const router = express.Router(); // Create a new router object to define routes
const notesController = require('../controllers/notesController'); // Import the notesController module to handle note-related operations
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);

router.route('/') // Define a route for the root path of the '/notes' endpoint
    .get(notesController.getAllNotes) // Handle GET requests to the '/notes' endpoint
    .post(notesController.createNewNote) // Handle POST requests to the '/notes' endpoint
    .patch(notesController.updateNote) // Handle PATCH requests to the '/notes' endpoint
    .delete(notesController.deleteNote); // Handle DELETE requests to the '/notes' endpoint

module.exports = router; // Export the router object so it can be used in other parts of the application