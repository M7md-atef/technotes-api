const express = require('express'); // Import the Express framework
const router = express.Router(); // Create a new router object to define routes
const usersController = require('../controllers/usersController'); // Import the usersController module to handle user-related operations
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);

router.route('/') // Define a route for the root path of the '/users' endpoint
    .get(usersController.getAllUsers) // Handle GET requests to the '/users' endpoint
    .post(usersController.createNewUser) // Handle POST requests to the '/users' endpoint
    .patch(usersController.updateUser) // Handle PATCH requests to the '/users' endpoint
    .delete(usersController.deleteUser); // Handle DELETE requests to the '/users' endpoint

module.exports = router; // Export the router object so it can be used in other parts of the application