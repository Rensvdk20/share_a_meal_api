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
const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "secret", "street", "city");';

chai.should();
chai.use(chaiHttp);

describe('Manage users api/user', () => {
    describe('UC-201 add user', () => {
        beforeEach((done) => {
            //Connect to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empty database for testing
                conn.query(CLEAR_DB + INSERT_USER, function (dbError, results, fields) {
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
                emailAdress: "j.doe@server.com",
                phoneNumber: "+31612345678",
                password: "secret"
            })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(400);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.a('string').that.contains('Firstname must be a string');
                
                done();
            });
        });

        it('TC 201-2 When an empty object is send, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({})
            .end((err, res) => {
                assert.ifError(err);
 
                res.should.have.status(400);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.a('string').that.contains('You have to send at least one valid field');
                
                done();
            });
        });

        it('TC 201-3 If the email is already in use, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: 'first',
                lastName: "last",
                street: "street",
                city: "city",
                emailAdress: "name@server.nl",
                password: "secret"
            })
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(400);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.a('string').that.contains('Email is already used');
                
                done();
            });
        });
    });

    describe('UC-202 get all users', () => {
        beforeEach((done) => {
            //Connect to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empty database for testing
                conn.query(CLEAR_DB + INSERT_USER, function (dbError, results, fields) {
                        // When done with the connection, release it.
                        conn.release();

                        // Handle error after the release.
                        if (dbError) throw dbError;

                        done();
                    }
                )
            });
        });

        it('TC-202-1 Should return a list of all users', (done) => {
            chai.request(server).get('/api/user')
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(200);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.a('array');
                for(user of result) {
                    user.should.include.all.keys('id', 'firstName', 'lastName', 'street', 'city', 'isActive', 'emailAdress', 'password', 'roles');
                }

                done();
            });
        });
    });

    // describe('UC-203 get all users', () => {
    //     //Not yet implemented
    // });

    describe('UC-204 get a user by id', () => {
        beforeEach((done) => {
            //Connect to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empty database for testing
                conn.query(CLEAR_DB + INSERT_USER, function (dbError, results, fields) {
                        // When done with the connection, release it.
                        conn.release();

                        // Handle error after the release.
                        if (dbError) throw dbError;

                        done();
                    }
                )
            });
        });

        it(`TC-204-1 If the user doesn't exist, a valid error should be returned.`, (done) => {
            chai.request(server).get('/api/user/0')
            .end((err, res) => {
                assert.ifError(err);

                res.should.have.status(404);
                res.should.be.an('object');
                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.a('string').that.contains('User not found');

                done();
            });
        });

        it('TC-204-2 The returned object should contain the right keys', (done) => {
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
                conn.query(CLEAR_DB + INSERT_USER, function (dbError, results, fields) {
                        // When done with the connection, release it.
                        conn.release();

                        // Handle error after the release.
                        if (dbError) throw dbError;

                        done();
                    }
                )
            });
        });

        it('TC-205-1 Should return the user with the updated values', (done) => {
            const id = 1;
            newUserInfo = {
                firstName: 'Foo',
                lastName: "Bar",
                street: "Kerkstraat",
                city: "Amsterdam",
                emailAdress: "f.bar@server.com",
                password: "verySecret"
            }

            chai.request(server).put(`/api/user/${id}`).send(newUserInfo)
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

                    res.should.have.status(200);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'result');

                    let { status, result } = res.body;
                    status.should.be.a('number');
                    result.should.be.a('object');
                    result.should.contain(newUserInfo);

                    done();
                });
            });
        });

        it('TC 205-2 When an empty object is send, a valid error should be returned', (done) => {
            chai.request(server).put('/api/user/1').send({

            })
            .end((err, res) => {
                assert.ifError(err)
                res.should.have.status(400);
                res.should.be.an('object');

                res.body.should.be.an('object').that.has.all.keys('status', 'result');

                let { status, result } = res.body;
                status.should.be.a('number');
                result.should.be.a('string').that.contains('You have to send at least one valid field');
                
                done();
            });
        });

        it("TC-205-3 If the user doesn't exist, a valid error should be returned", () => {
            const id = 0;

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
    });

    describe('UC-206 delete user', () => {
        beforeEach((done) => {
            //Connect to the database
            dbconnection.getConnection(function (connError, conn) {
                if (connError) throw connError;

                //Empty database for testing
                conn.query(CLEAR_DB + INSERT_USER, function (dbError, results, fields) {
                        // When done with the connection, release it.
                        conn.release();

                        // Handle error after the release.
                        if (dbError) throw dbError;

                        done();
                    }
                )
            });
        });

        it("TC-206-1 If the user doesn't exist, a valid error should be returned", () => {
            const id = 0;

            chai.request(server).delete(`/api/user/${id}`)
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

        it('TC-206-2 check if the delete was successful', (done) => {
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
                    res.body.should.be.an('object').that.has.all.keys('status', 'result');

                    let { status, result } = res.body;
                    status.should.be.a('number');
                    result.should.be.a('string').that.contains('User not found');

                    done();
                });
            });
        });
    });
});