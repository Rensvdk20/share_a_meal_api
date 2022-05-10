process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
require('dotenv').config();
const dbconnection = require('../../database/dbconnection');

//Clear database sql
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

//Insert user sql
const INSERT_USER_1 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "d.ambesi@avans.nl", "secret", "street", "city");';

const INSERT_USER_2 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(2, "test", "test", "test@server.com", "test", "test", "test");';

chai.should();
chai.use(chaiHttp);

describe('Manage users api/user', () => {
    describe('UC-201 add user', () => {
        beforeEach((done) => {
            //Connect to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empty database for testing
                conn.query(CLEAR_DB, function (dbError, results, fields) {
                        // When done with the connection, release it.
                        conn.release();

                        // Handle error after the release.
                        if (dbError) throw dbError;

                        done();
                    }
                )
            });
        });

        it('TC 201-1 When a required input is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                //Firstname is missing
                lastName: "Doe",
                street: "Lovensdijkstraat 61",
                city: "Breda",
                isActive: true,
                emailAdress: "j.doe@server.com",
                phoneNumber: "+31612345678",
                password: "secret"
            })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(400);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'message');

                let { status, message } = res.body;
                status.should.be.a('number');
                message.should.be.a('string').that.contains('Firstname must be a string');
                
                done();
            });
        });

        // it('TC 201-2 If the email is invalid, a valid error should be returned', (done) => {

        // });

        // it('TC 201-3 If the password is invalid, a valid error should be returned', (done) => {
            
        // });

        it('TC 201-4 If the email is already in use, a valid error should be returned', (done) => {
            //Connect to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empty database for testing
                conn.query(INSERT_USER_1, function (dbError, results, fields) {
                        // When done with the connection, release it.
                        conn.release();

                        // Handle error after the release.
                        if (dbError) throw dbError;

                        chai.request(server).post('/api/user').send({
                            firstName: 'first',
                            lastName: "last",
                            street: "street",
                            city: "city",
                            isActive: true,
                            emailAdress: "d.ambesi@avans.nl",
                            phoneNumber: "+31646386382",
                            password: "secret"
                        })
                        .end((err, res) => {
                            assert.ifError(err);
            
                            res.should.have.status(409);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('status', 'message');
            
                            let { status, message } = res.body;
                            status.should.be.a('number');
                            message.should.be.a('string').that.contains('Email is already used');
                            
                            done();
                        });
                    }
                )
            });
        });

        it('TC 201-5 A user was added succesfully', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "first",
                lastName: "last",
                street: "street",
                city: "city",
                isActive: true,
                emailAdress: "email@server.nl",
                phoneNumber: "+31635368583",
                password: "secret"
            })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(200);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.an('object').that.includes.key('username', "token");
                
                done();
            });
        });
    });

    describe('UC-202 get all users', () => {
        var run = false;
        beforeEach((done) => {
            //Connect to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empty database for testing
                conn.query(CLEAR_DB + INSERT_USER_1 + INSERT_USER_2, function (dbError, results, fields) {
                        // When done with the connection, release it.
                        conn.release();

                        // Handle error after the release.
                        if (dbError) throw dbError;

                        done();
                    }
                )
            });
        });

        // it('TC-202-1 Should return zero users', (done) => {

        // });

        it('TC-202-2 Should return a list of 2 users', (done) => {
            chai.request(server).get('/api/user')
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(200);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.an('array');
                // result.length.should.be(2);
                for(user of result) {
                    user.should.include.all.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'password', 'roles');
                }

                done();
            });
        });

        // it("UC-202-3 Should return an empty list by searching for an non-existing name", (done) => {

        // });
    
        // it("UC-202-4 Should return a list of user filtered by non-active status", (done) => {
            
        // });

        // it("UC-202-5 Should return a list of user filtered by active status", (done) => {

        // });

        // it("UC-202-5 Should return alist by searching for an existing name", (done) => {

        // });
    });

    // describe('UC-203 get user profile', () => {
    //     //Not yet implemented
    // });

    describe('UC-204 get a user by id', () => {
        beforeEach((done) => {
            //Connect to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empty database for testing
                conn.query(CLEAR_DB + INSERT_USER_1, function (dbError, results, fields) {
                        // When done with the connection, release it.
                        conn.release();

                        // Handle error after the release.
                        if (dbError) throw dbError;

                        done();
                    }
                )
            });
        });

        // it('TC-204-1 Token not valid', (done) => {

        // });

        it(`TC-204-2 If the user doesn't exist, a valid error should be returned.`, (done) => {
            chai.request(server).get('/api/user/0')
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(404);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'message');

                let { status, message } = res.body;
                status.should.be.a('number');
                message.should.be.a('string').that.contains('User not found');

                done();
            });
        });

        it('TC-204-3 User exists and returns the correct keys', (done) => {
            chai.request(server).get('/api/user/1')
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(200);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.a('object');
                result.should.include.all.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'password', 'roles');

                done();
            });
        });
    });

    describe('UC-205 update user', () => {
        beforeEach((done) => {
            //Connect to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empty database for testing
                conn.query(CLEAR_DB + INSERT_USER_1, function (dbError, results, fields) {
                        // When done with the connection, release it.
                        conn.release();

                        // Handle error after the release.
                        if (dbError) throw dbError;

                        done();
                    }
                )
            });
        });

        it('TC 205-1 When a required input is missing, a valid error should be returned', (done) => {
            chai.request(server).put('/api/user/1').send({
                //Firstname is missing
                lastName: "Doe",
                street: "Lovensdijkstraat 61",
                city: "Breda",
                isActive: true,
                emailAdress: "j.doe@server.com",
                phoneNumber: "+31612345678",
                password: "secret"
            })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(400);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'message');

                let { status, message } = res.body;
                status.should.be.a('number');
                message.should.be.a('string').that.contains('Firstname must be a string');
                
                done();
            });
        });

         // it('TC 205-2 If an invalid postalcode is used, a valid error should be returned', (done) => {

        // });

        // it('TC 205-3 If an invalid phonenumber is used, a valid error should be returned', (done) => {
            
        // });

        it("TC-205-4 If the user doesn't exist, a valid error should be returned", () => {
            const id = 0;

            newUserInfo = {
                firstName: "newFirst",
                lastName: "newLast",
                street: "newStreet",
                city: "newCity",
                isActive: true,
                emailAdress: "newEmail@server.nl",
                phoneNumber: "+31635368554",
                password: "newSecret"
            }

            chai.request(server).put(`/api/user/${id}`).send(newUserInfo)
            .end((errorUpdate, res) => {
                assert.ifError(errorUpdate);

                res.should.have.status(404);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.a('string').that.contains('User not found');
            });
        });

        // it("TC-205-5 Not logged in", () => {

        // });

        it('TC-205-6 Succesfully updates the user', (done) => {
            const id = 1;
            newUserInfo = {
                firstName: 'Foo',
                lastName: "Bar",
                street: "Kerkstraat",
                city: "Amsterdam",
                isActive: true,
                emailAdress: "f.bar@server.com",
                phoneNumber: "+31624745783",
                password: "verySecret"
            }

            chai.request(server).put(`/api/user/${id}`).send(newUserInfo)
            .end((errorUpdate, res) => {
                assert.ifError(errorUpdate);

                res.should.have.status(200);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'message');

                let { status, message } = res.body;
                status.should.be.a('number');
                message.should.be.a('string');

                chai.request(server).get(`/api/user/${id}`)
                .end((errorGet, res) => {
                    assert.ifError(errorGet);

                    res.should.have.status(200);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'result');

                    let { status, result } = res.body;
                    status.should.be.a('number');
                    result.should.be.a('object');
                    if(result.isActive === 0) {
                        result.isActive = false;
                    } else if(result.isActive === 1) {
                        result.isActive = true;
                    }

                    result.should.contain(newUserInfo);

                    done();
                });
            });
        });
    });

    describe('UC-206 delete user', () => {
        beforeEach((done) => {
            //Connect to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empty database for testing
                conn.query(CLEAR_DB + INSERT_USER_1, function (dbError, results, fields) {
                        // When done with the connection, release it.
                        conn.release();

                        // Handle error after the release.
                        if (dbError) throw dbError;

                        done();
                    }
                )
            });
        });

        it("TC-206-1 If the user doesn't exist, a valid error should be returned", (done) => {
            const id = 0;

            chai.request(server).delete(`/api/user/${id}`)
            .end((errorUpdate, res) => {
                assert.ifError(errorUpdate);

                res.should.have.status(404);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'message');

                let { status, message } = res.body;
                status.should.be.a('number');
                message.should.be.a('string').that.contains('User not found');

                done();
            });
        });

        // it('TC-206-2 Not logged in', (done) => {
            
        // });

        // it('TC-206-3 Actor is not the owner', (done) => {
            
        // });

        it('TC-206-4 Deleted the user succesfully', (done) => {
            const id = 1;

            chai.request(server).delete(`/api/user/${id}`)
            .end((errorUpdate, res) => {
                assert.ifError(errorUpdate);

                res.should.have.status(200);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');

                chai.request(server).get(`/api/user/${id}`)
                .end((errorGet, res) => {
                    assert.ifError(errorGet);

                    res.should.have.status(404);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('User not found');

                    done();
                });
            });
        });
    });
});