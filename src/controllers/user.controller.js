const assert = require('assert');

let database = [];
let user_id = 0;

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        let {firstName, lastName, street, city, isActive, emailAdress, phoneNumber, password} = user;
        try {
            assert(typeof firstName === 'string', 'Title must be a string');
            assert(typeof lastName === 'string', 'lastName must be a string');
            assert(typeof street === 'string', 'street must be a string');
            assert(typeof city === 'string', 'city must be a string');
            assert(typeof isActive === 'boolean', 'isActive must be a boolean');
            assert(typeof emailAdress === 'string', 'emailAddress must be a string');
            assert(typeof phoneNumber === 'string', 'phoneNumber must be a string');
            assert(typeof password === 'string', 'password must a string');
            
            next();
        } catch (err) {
            console.log(err);
            res.status(400).json({
                status: 400,
                result: err.message
            });
        }
    },
    addUser: (req, res) => {
        let user = req.body;

        if(!checkEmailDuplicate(user.emailAdress)) {
            user_id++;
            user = {
                id: user_id,
                firstName: user.firstName,
                lastName: user.lastName,
                street: user.street,
                city: user.city,
                isActive: user.isActive,
                emailAdress: user.emailAdress,
                phoneNumber: user.phoneNumber,
                password: user.password
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
    },
    getAllUsers: (req, res) => {
        res.status(200).json({
            status: 200,
            result: database
        });
    },
    getUserProfile: (req, res) => {
        res.status(501).json({
            status: 501,
            result: "This endpoint is not yet implemented"
        });
    },
    getUserById: (req, res) => {
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
    },
    updateUser: (req, res) => {
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
                isActive: newUserInfo.isActive,
                emailAdress: newUserInfo.emailAdress,
                phoneNumber: newUserInfo.phoneNumber,
                password: newUserInfo.password
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
    },
    deleteUser: (req, res) => {
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
    }
}

function checkEmailDuplicate(emailAdress) {
    const filteredArray = database.filter((o) => o.emailAdress === emailAdress);
    if(filteredArray.length > 0) {
        return true;
    } return false;
}

module.exports = controller;