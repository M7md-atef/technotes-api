const express = require('express') // Import the Express framework
const router = express.Router() // Create an instance of the Express router
const authController = require('../controllers/authController')
const loginLimiter = require('../middleware/loginLimiter')

router.route('/')
    .post(loginLimiter, authController.login)
    
router.route('/refresh')
    .get(authController.refresh)
    
router.route('/logout')
    .post(authController.logout)

module.exports = router


