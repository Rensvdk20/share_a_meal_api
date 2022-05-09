const assert = require('assert');
const dbconnection = require('../../database/dbconnection');

let controller = {
    validateUserPost: (req, res, next) => {
        let user = req.body;
        let {firstName, lastName, street, city, isActive, emailAdress, phoneNumber, password} = user;
        try {
            //Check if the object contains at least one valid field
            assert(Object.keys(user).length > 0, 'You have to send at least one valid field');
            
            //Check if each field has the correct type
            assert(typeof firstName === 'string', 'Firstname must be a string');
            assert(typeof lastName === 'string', 'LastName must be a string');
            assert(typeof street === 'string', 'Street must be a string');
            assert(typeof city === 'string', 'City must be a string');
            //Not required
            if(isActive) { assert(typeof isActive === 'boolean', 'IsActive must be a boolean'); }
            assert(typeof emailAdress === 'string', 'EmailAddress must be a string');
            //Not required
            if(phoneNumber) { assert(typeof phoneNumber === 'string', 'PhoneNumber must be a string'); }
            assert(typeof password === 'string', 'Password must a string');

            next();
        } catch (err) {
            const error = {
                status: 400,
                result: err.message
            }

            console.log(error);
            next(error);
        }
    },
    validateUserUpdate: (req, res, next) => {
        let updatedUserBody = req.body;
        let {firstName, lastName, street, city, isActive, emailAdress, phoneNumber, password} = updatedUserBody;
        try {
            //Check if the object contains at least one valid field
            assert(Object.keys(updatedUserBody).length > 0, 'You have to send at least one valid field');
            
            //Check the field only if it is send with the body
            if(firstName) {assert(typeof firstName === 'string', 'Firstname must be a string'); }
            if(lastName) {assert(typeof lastName === 'string', 'LastName must be a string'); }
            if(street) {assert(typeof street === 'string', 'Street must be a string'); }
            if(city) {assert(typeof city === 'string', 'City must be a string'); }
            if(isActive) { assert(typeof isActive === 'boolean', 'IsActive must be a boolean'); }
            if(emailAdress) { assert(typeof emailAdress === 'string', 'EmailAddress must be a string');; }
            if(phoneNumber) { assert(typeof phoneNumber === 'string', 'PhoneNumber must be a string'); }
            if(password) { assert(typeof password === 'string', 'Password must a string'); }

            next();
        } catch (err) {
            const error = {
                status: 400,
                result: err.message
            }

            next(error);
        }
    },
    addUser: (req, res) => {
        let user = req.body;
        dbconnection.getConnection(function(connError, conn) {
            //Not connected
            if (connError) {
                res.status(502).json({
                    status: 502,
                    result: "Couldn't connect to database"
                }); return;
            }
            
            //Insert the user object into the database
            conn.query(`INSERT INTO user SET ?`, user, function (dbError, results, fields) {
                // When done with the connection, release it.
                conn.release();
                
                //Check if email address is already used

                // Handle error after the release.
                if(dbError) {
                    console.log(dbError);
                    if(dbError.errno == 1062) {
                        res.status(400).json({
                            status: 400,
                            result: "Email is already used"
                        });
                    } else {
                        res.status(500).json({
                            status: 500,
                            result: "Error"
                        });
                    }
                } else {
                    res.status(201).json({
                        status: 201,
                        result: "User successfully added"
                    });
                }
            });
        });
    },
    getAllUsers: (req, res) => {
        dbconnection.getConnection(function(connError, conn) {
            //Not connected
            if (connError) {
                res.status(502).json({
                    status: 502,
                    result: "Couldn't connect to database"
                }); return;
            }
            
            conn.query('SELECT * FROM user', function (dbError, results, fields) {
                // When done with the connection, release it.
                conn.release();
                
                // Handle error after the release.
                if (dbError) {
                    console.log(dbError);
                    res.status(500).json({
                        status: 500,
                        result: "Error"
                    }); return;
                }
                
                res.status(200).json({
                    status: 200,
                    result: results
                });
            });
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
        dbconnection.getConnection(function(connError, conn) {
            //Not connected
            if (connError) {
                res.status(502).json({
                    status: 502,
                    result: "Couldn't connect to database"
                }); return;
            }
            
            conn.query('SELECT * FROM user WHERE id = ' + userId, function (dbError, results, fields) {
                // When done with the connection, release it.
                conn.release();
                
                // Handle error after the release.
                if (dbError) {
                    console.log(dbError);
                    res.status(500).json({
                        status: 500,
                        result: "Error"
                    }); return;
                }
                
                const result = results[0];
                if(result) {
                    res.status(200).json({
                        status: 200,
                        result: result
                    });
                } else {
                    res.status(404).json({
                        status: 404,
                        result: "User not found"
                    });
                }
            });
        });
    },
    updateUser: (req, res) => {
        const newUserInfo = req.body;
        const userId = req.params.id;
        dbconnection.getConnection(function(connError, conn) {
            //Not connected
            if (connError) {
                res.status(502).json({
                    status: 502,
                    result: "Couldn't connect to database"
                }); return;
            }
            
            conn.query('UPDATE user SET ? WHERE id = ?', [newUserInfo, userId], function (dbError, results, fields) {
                // When done with the connection, release it.
                conn.release();
                
                // Handle error after the release.
                if(results.affectedRows > 0) {
                    res.status(200).json({
                        status: 200,
                        result: `User: ${userId} successfully updated`
                    });
                } else {
                    if(dbError == null) {
                        res.status(404).json({
                            status: 404,
                            result: "User not found"
                        });
                    } else {
                        console.log(dbError);
                        res.status(500).json({
                            status: 500,
                            result: "Error"
                        });
                    }
                }
            });
        });
    },
    deleteUser: (req, res) => {
        const userId = req.params.id;
        dbconnection.getConnection(function(connError, conn) {
            //Not connected
            if (connError) {
                res.status(502).json({
                    status: 502,
                    result: "Couldn't connect to database"
                }); return;
            }
            
            conn.query('DELETE FROM user WHERE id = ?', userId, function (dbError, results, fields) {
                // When done with the connection, release it.
                conn.release();
                
                // Handle error after the release.
                if(dbError) {
                    res.status(500).json({
                        status: 500,
                        result: "Error"
                    }); return;
                }
                
                if(results.affectedRows > 0) {
                    res.status(200).json({
                        status: 200,
                        result: `User: ${userId} successfully deleted`
                    });
                } else {
                    res.status(404).json({
                        status: 404,
                        result: "User not found"
                    });
                }
            });
        });
    }
}

module.exports = controller;