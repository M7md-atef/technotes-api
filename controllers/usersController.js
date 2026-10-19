const User = require('../models/User'); // Import the User model from the models directory
const Note = require('../models/Note'); // Import the Note model from the models directory
const asyncHandler = require('express-async-handler'); // Import the express-async-handler middleware for handling asynchronous route handlers
const bcrypt = require('bcrypt'); // Import the bcrypt library for password hashing
const { ROLES, canManageUser } = require('../middleware/userPermissions')
const VALID_ROLES = Object.values(ROLES)

//@desc Get all users
//@route GET /users
//@access Private
const getAllUsers = asyncHandler(async (req, res) => { // Define an asynchronous function to get all users
    if (!req.roles.includes(ROLES.Admin) && !req.roles.includes(ROLES.Manager)) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const users = await User.find().select('-password').lean(); // Fetch all users from the database, excluding the password field, and return a lean object
    if(!users?.length) { // Check if there are no users found
        return res.status(400).json({ message: 'No users found' }); // Return a 400 status code with a message if no users are found
    }
    res.json(users); // Return the list of users
});

//@desc Create a new user
//@route POST /users
//@access Private
const createNewUser = asyncHandler(async (req, res) => { // Define an asynchronous function to create a new user
    const { username, password, roles } = req.body; // Destructure the username, password, and roles from the request body

    if (!req.roles.includes(ROLES.Admin) && !req.roles.includes(ROLES.Manager)) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    if (roles !== undefined && (!Array.isArray(roles) || roles.some(role => !VALID_ROLES.includes(role)))) {
        return res.status(400).json({ message: 'Invalid roles' });
    }

    const assignedRoles = Array.isArray(roles) && roles.length ? roles : [ROLES.Employee];
    if (!req.roles.includes(ROLES.Admin) && assignedRoles.some(role => role !== ROLES.Employee)) {
        return res.status(403).json({ message: 'Managers can only create employee accounts' });
    }
    
    // Confirm data
    if(!username || !password) { // Check if username, password, or roles are missing or invalid
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check for duplicate username
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec(); // Check if a user with the same username already exists in the database
    if(duplicate) { // If a duplicate user is found
        return res.status(409).json({ message: 'Duplicate username' }); // Return a 409 status code with a message indicating a duplicate username
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with a salt round of 10

    // Create user
    const user = await User.create({
        username,
        password: hashedPassword,
        roles: assignedRoles
    });

    if(user) { // If the user was created successfully
        return res.status(201).json({ message: 'New user created' }); // Return a 201 status code with a success message
    } else {
        return res.status(400).json({ message: 'Invalid user data received' }); // Return a 400 status code with an error message
    }
});

//@desc Update a user
//@route PATCH /users
//@access Private
const updateUser = asyncHandler(async (req, res) => { // Define an asynchronous function to update user information
    const { id, username, roles, active, password } = req.body; // Destructure the id, username, roles, active status, and password from the request body

    if (!req.roles.includes(ROLES.Admin) && !req.roles.includes(ROLES.Manager)) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    // Confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || roles.some(role => !VALID_ROLES.includes(role)) || typeof active !== 'boolean') { // Check if any required fields are missing or invalid
        return res.status(400).json({ message: 'All fields are required' }); // Return a 400 status code with a message indicating that all fields are required
    }

    const user = await User.findById(id).exec(); // Find the user by ID in the database

    if(!user) { // If the user is not found
        return res.status(400).json({ message: 'User not found' }); // Return a 400 status code with a message indicating that the user was not found
    }

    if (!canManageUser(req.roles, user.roles)) {
        return res.status(403).json({ message: 'You are not authorized to manage this user' });
    }

    if (!req.roles.includes(ROLES.Admin) && roles.some(role => role !== ROLES.Employee)) {
        return res.status(403).json({ message: 'Managers can only assign the employee role' });
    }

    // Check for duplicate username
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec(); // Check if a user with the same username already exists in the database
    //Allow updates to the original user
    if(duplicate && duplicate?._id.toString() !== id) { // If a duplicate user is found and it's not the same user being updated
        return res.status(409).json({ message: 'Duplicate username' }); // Return a 409 status code with a message indicating a duplicate username
    }

    user.username = username; // Update the user's username
    user.roles = roles; // Update the user's roles
    user.active = active; // Update the user's active status

    if(password) { // If a new password is provided
        // Hash password
        user.password = await bcrypt.hash(password, 10); // Hash the new password with a salt round of 10 and update the user's password
    }

    const updatedUser = await user.save(); // Save the updated user information to the database
    return res.status(200).json({ message: 'User updated successfully' });
});

//@desc Delete a user
//@route DELETE /users
//@access Private
const deleteUser = asyncHandler(async (req, res) => { // Define an asynchronous function to delete a user
    const { id } = req.body; // Destructure the id from the request body

    if (!req.roles.includes(ROLES.Admin) && !req.roles.includes(ROLES.Manager)) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    if(!id) { // Check if the id is not provided
        return res.status(400).json({ message: 'User ID required' }); // Return a 400 status code with a message indicating that the user ID is required
    }

    const user = await User.findById(id).exec(); // Find the user by ID in the database

    if(!user) { // If the user is not found
        return res.status(404).json({ message: 'User not found' }); // Return a 404 status code with a message indicating that the user was not found
    }

    if (!canManageUser(req.roles, user.roles)) {
        return res.status(403).json({ message: 'You are not authorized to manage this user' });
    }

    const note = await Note.findOne({ user: id }).lean().exec(); // Check if there are any note associated with the user to be deleted
    if(note) { // If there is a note associated with the user
        return res.status(400).json({ message: 'User has assigned notes' }); // Return a 400 status code with a message indicating that the user has assigned notes
    }

    const result = await user.deleteOne(); // Delete the user from the database
    if(!result) { // If the user was not deleted
        return res.status(500).json({ message: 'Failed to delete user' }); // Return a 500 status code with a message indicating failure to delete the user
    }
    return res.status(200).json({ message: `User ${user.username} with ID ${id} deleted successfully` }); // Return a 200 status code with a message indicating successful deletion
});

module.exports = { // Export the defined functions so they can be used in other parts of the application
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
};
