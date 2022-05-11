const assert = require('assert');
const dbconnection = require('../../database/dbconnection');

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        let {firstName, lastName, street, city, isActive, emailAdress, phoneNumber, password} = user;
        try {
            //Check if each field has the correct type
            assert(typeof firstName === 'string', 'Firstname must be a string');
            assert(typeof lastName === 'string', 'LastName must be a string');
            assert(typeof street === 'string', 'Street must be a string');
            assert(typeof city === 'string', 'City must be a string');
            assert(typeof isActive === 'boolean', 'IsActive must be a boolean');
            assert(typeof emailAdress === 'string', 'EmailAddress must be a string');
            assert(typeof phoneNumber === 'string', 'PhoneNumber must be a string');
            assert(typeof password === 'string', 'Password must a string');

            next();
        } catch (err) {
            const error = {
                status: 400,
                message: err.message
            }

            console.log(error);
            next(error);
        }
    },
    validateId: (req, res, next) => {
        const userId = req.params.id;
        try {
            assert(Number.isInteger(parseInt(userId)), "Id must be a number");
            next();
        } catch (err) {
            const error = {
                status: 400,
                message: err.message
            }

            console.log(error);
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
            conn.query(`INSERT INTO user SET ?`, user, function (dbError, result, fields) {
                // When done with the connection, release it.
                conn.release();

                // Handle error after the release.
                if(dbError) {
                    console.log(dbError);
                    if(dbError.errno == 1062) {
                        res.status(409).json({
                            status: 409,
                            message: "Email is already used"
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
                        result: {
                            id: result.insertId,
                            ...user
                        }
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
                        message: "User does not exist"
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
                        message: `${userId} successfully updated`,
                        result: {
                            id: userId,
                            ...newUserInfo
                        }
                    });
                } else {
                    if(dbError == null) {
                        res.status(404).json({
                            status: 404,
                            result: "User does not exist"
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
                        message: `User: ${userId} successfully deleted`
                    });
                } else {
                    res.status(400).json({
                        status: 400,
                        message: "User does not exist"
                    });
                }
            });
        });
    }
}

module.exports = controller;