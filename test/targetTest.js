let request = require('supertest');
let chai = require('chai');
let expect = chai.expect;
let should = chai.should();
let assert = chai.assert;

let app = require('../app');

const userCredentials = {
    email: 'test@mail.com',
    password: 'password'
};

let authenticatedUser = request.agent(app);

describe('logging in', function () {
    it('should login', function (done) {
        makePostRequest('/login', userCredentials, 302, function (err, res) {
            expect('Location', '/profile');
            done();
        });
    });
});

function makeGetRequest(route, statusCode, done) {
    authenticatedUser
        .get(route)
        .expect(statusCode)
        .end(function (err, res) {
            if (err) {
                return done(err);
            }

            done(null, res);
        });
}

function makePostRequest(route, data, statusCode, done) {
    authenticatedUser
        .post(route)
        .send(data)
        .expect(statusCode)
        .end(function (err, res) {
            if (err) {
                return done(err);
            }

            done(null, res);
        });
}

describe('Testing api target route', function () {
    let existingTargetId;

    beforeEach(function (done) {
        Target.findOne({}, {}, function (err, results) {
            if (results) {
                existingTargetId = results.id;
            }
        }).then(() => done())
            .catch(() => done());
    });

    describe('Submit target with valid parameters', function () {
        it('should return 201 when target submitted', function (done) {
            authenticatedUser
                .post('/api/targets')
                .field('image_url', 'test/assets/images/testimage.png')
                .field('targetName', 'target 1')
                .field('targetDescription', 'target 1 description')
                .field('api_key', '5e891347eee2794b40a1c6bd')
                .expect(201)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        }).timeout(5000);

        it('should return 301 when target updated successfully', function (done) {
            authenticatedUser
                .post(`/api/targets/${existingTargetId}`)
                .attach('targetImage', 'test/assets/images/testimage.png')
                .field('targetName', 'updated target name')
                .field('targetDescription', 'updated target description')
                .expect(301)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        }).timeout(5000);
    });

    describe('Submit target with invalid parameters', function () {
        it('should return 422 when no target name given on create', function (done) {
            authenticatedUser
                .post('/api/targets')
                .attach('targetImage', 'test/assets/images/testimage.png')
                .field('targetName', '')
                .field('targetDescription', '')
                .expect(422)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        }).timeout(5000);

        it('should return 422 when no target name given on update', function (done) {
            authenticatedUser
                .post(`/api/targets/${existingTargetId}`)
                .attach('targetImage', 'test/assets/images/testimage.png')
                .field('targetName', '')
                .field('targetDescription', 'updated target description')
                .expect(422)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        }).timeout(5000);
    });

    describe('Test fetch submissions', function () {
        it('should return 200 when fetching all targets', function (done) {
            makeGetRequest('/api/targets', 200, function (err, res) {
                if (err) {
                    return done(err);
                }
                assert.typeOf(res.body.targets, 'array');
                done();
            });
        });

        it('should return  200 and an existing target', function (done) {
            makeGetRequest(`/api/targets/${existingTargetId}`, 200, function (err, res) {
                if (err) {
                    return done(err);
                }
                assert.typeOf(res.body, 'object');
                done();
            });
        });
    });
});

describe('Testing admin target route', function () {
    it('should return 200 when fetching all targets', function (done) {
        makeGetRequest('/targets', 200, function (err, res) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('should return 200 when fetching all targets with pagination', function (done) {
        makeGetRequest('/targets?page=2', 200, function (err, res) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('should return 200 when fetching all targets with pagination when page is out if range', function (done) {
        makeGetRequest('/targets?page=36781236871', 200, function (err, res) {
            if (err) {
                return done(err);
            }
            done();
        });
    });
});
