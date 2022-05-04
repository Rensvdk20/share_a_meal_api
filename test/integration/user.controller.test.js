const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');

chai.should();
chai.use(chaiHttp);

describe('Manage users api/user', () => {
    describe('UC-201 add movies', () => {
        // beforeEach((done) => {
        //     database = [];
        //     done();
        // });

        it('When a required input is missing, a valid error should be returned', (done) => {
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
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.equal(400);
                result.should.be.a('string').that.equals('Firstname must be a string');
                done();
            });
        });
    })
});