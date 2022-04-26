const express = require('express');
const app = express();
const router = express.Router();

let database = [];
let user_id = 0;

//########## Users ###############

//Register user
router.post('/api/user', (req, res) => {
    let user = req.body;

    if(!checkEmailDuplicate(user.emailAdress)) {
        user_id++;
        user = {
            id: user_id,
            firstName: user.firstName,
            lastName: user.lastName,
            street: user.street,
            city: user.city,
            emailAdress: user.emailAdress,
            phoneNumber: user.phoneNumber,
            password: user.password,
            roles: user.roles
        };
    
        database.push(user);
        res.status(201).json({
            status: 201,
            result: user
        });
    } else {
        res.status(409).json({
            status: 409,
            result: "Email already exists",
        });
    }
})

//Get all users
router.get('/api/user', (req, res) => {
    res.status(200).json({
        status: 200,
        result: database
    });
});

//Request current user profile
router.get("/api/user/profile", (req, res) => {
    res.status(501).json({
        status: 501,
        result: "This endpoint is not yet implemented"
    });
});

//Get user by id
router.get("/api/user/:id", (req, res) => {
    const userId = req.params.id;
    let user = database.find((item) => item.id == userId);
    if (user) {
        res.status(200).json({
            status: 200,
            result: user,
        });
    } else {
        res.status(404).json({
            status: 404,
            result: "User not found"
        });
    }
})

//Update user
router.put("/api/user/:id", (req, res) => {
    let newUserInfo = req.body;
    const userId = req.params.id;
    let userIndex = database.findIndex((obj) => obj.id == userId);

    if(userIndex > -1) {
        if(!checkEmailDuplicate(user.emailAdress)) {
            database[userIndex] = {
                id: parseInt(userId),
                firstName: newUserInfo.firstName,
                lastName: newUserInfo.lastName,
                street: newUserInfo.street,
                city: newUserInfo.city,
                password: newUserInfo.password,
                emailAdress: newUserInfo.emailAdress,
                phoneNumber: newUserInfo.phoneNumber,
                roles: newUserInfo.roles
            };

            res.status(200).json({
                status: 200,
                result: database[userIndex]
            });
        }
    } else {
        res.status(404).json({
            status: 404,
            result: "User not found"
        });
    }
})

//Delete user
router.delete("/api/user/:id", (req, res) => {
    const userId = req.params.id;
    let userIndex = database.findIndex((obj => obj.id == userId));
    if(userIndex > -1) {
        database.splice(userIndex, 1);

        res.status(202).json({
            status: 202,
            result: "Success"
        });
    } else {
        res.status(404).json({
            status: 404,
            result: "User not found"
        });
    }
});

module.exports = router;