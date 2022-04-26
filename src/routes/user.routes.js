const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

//########## Users ###############

//Register user
router.post('/api/user', userController.addUser);

//Get all users
router.get('/api/user', userController.getAllUsers);

//Request current user profile
router.get("/api/user/profile", userController.getUserProfile)

//Get user by id
router.get("/api/user/:id", userController.getUserById)

//Update user
router.put("/api/user/:id", userController.updateUser);

//Delete user
router.delete("/api/user/:id", userController.deleteUser);

module.exports = router;