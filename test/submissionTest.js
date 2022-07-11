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

let authenticatedUser = request.agent(app, null);

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

describe('Testing api submission route', function () {
    let existingTargetId;
    let existingSubmissionId;

    beforeEach(function (done) {
        Target.findOne({}, {}, function (err, results) {
            if (results) {
                existingTargetId = results.id;
            }
        }).then(() => {
            return Submission.findOne({}, {}, function (err, results) {
                if (results) {
                    existingSubmissionId = results.id;
                }
            });
        }).then(() => done())
            .catch(() => done());
    });

    describe('Submit submission with valid parameters', function () {
        it('should return 200 when submission submitted with good image url', function (done) {
            authenticatedUser
                .post(`/api/targets/${existingTargetId}/submissions`)
                .type('form')
                .send({
                    'image_url': 'https://i.imgur.com/u5UEZHx.png',
                    'api_key': '5e891347eee2794b40a1c6bd'
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        }).timeout(5000);

        it('should return 200 when submission submitted with api key as query parameter', function (done) {
            authenticatedUser
                .post(`/api/targets/${existingTargetId}/submissions?api_key=5e891347eee2794b40a1c6bd`)
                .type('form')
                .send({
                    'image_url': 'https://i.imgur.com/u5UEZHx.png'
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        }).timeout(5000);
    });

    describe('Submit submission with invalid parameters', function () {
        it('should return 400 when no url given', function (done) {
            authenticatedUser
                .post(`/api/targets/${existingTargetId}/submissions`)
                .type('form')
                .send({
                    'image_url': 'test',
                    'api_key': '5e891347eee2794b40a1c6bd'
                })
                .expect(400)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        }).timeout(5000);

        it('should return 400 when invalid url given', function (done) {
            authenticatedUser
                .post(`/api/targets/${existingTargetId}/submissions`)
                .type('form')
                .send('image_url=http://www.google.nl')
                .expect(400)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        }).timeout(5000);

        it('should return 401 when submission submitted without api_key', function (done) {
            authenticatedUser
                .post(`/api/targets/${existingTargetId}/submissions`)
                .type('form')
                .send({
                    'image_url': 'https://i.imgur.com/u5UEZHx.png'
                })
                .expect(401)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        }).timeout(5000);

        it('should return 401 when submission submitted with invalid api_key', function (done) {
            authenticatedUser
                .post(`/api/targets/${existingTargetId}/submissions`)
                .type('form')
                .send({
                    'image_url': 'https://i.imgur.com/u5UEZHx.png',
                    'api_key': '5e891347eee2344b44a1c6bd'
                })
                .expect(401)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        }).timeout(5000);
    });

    describe('Test fetch submissions', function () {
        it('should return 200 when fetching all submissions from specific target', function (done) {
            makeGetRequest(`/api/targets/${existingTargetId}/submissions`, 200, function (err, res) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                assert.typeOf(res.body, 'array');
                done();
            });
        });

        it('should return 200 when fetching all submissions', function (done) {
            makeGetRequest(`/api/submissions`, 200, function (err, res) {
                if (err) {
                    return done(err);
                }
                assert.typeOf(res.body, 'array');
                done();
            });
        });

        it('should return 200 when fetching an specific submissions', function (done) {
            makeGetRequest(`/api/submissions/${existingSubmissionId}`, 200, function (err, res) {
                if (err) {
                    return done(err);
                }
                assert.typeOf(res.body, 'object');
                done();
            });
        });
    });

    describe('Test delete submissions', function () {
        it('should return 200 when submission deleted', function (done) {
            authenticatedUser
                .post(`/api/submissions/${existingSubmissionId}/delete`)
                .type('form')
                .send({
                    'api_key': '5e891347eee2794b40a1c6bd'
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        }).timeout(5000);

        it('should return 401 when submission deleted with invalid api_key', function (done) {
            authenticatedUser
                .post(`/api/submissions/${existingSubmissionId}/delete`)
                .type('form')
                .send({
                    'api_key': '5e891347eee2344b44a1c6bd'
                })
                .expect(401)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        }).timeout(5000);
    });

    describe('Test delete targets', function () {
        it('should return 200 when target deleted', function (done) {
            authenticatedUser
                .post(`/api/targets/${existingTargetId}/delete`)
                .type('form')
                .send({
                    'api_key': '5e891347eee2794b40a1c6bd'
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        }).timeout(5000);

        it('should return 401 when target deleted with invalid api_key', function (done) {
            authenticatedUser
                .post(`/api/targets/${existingTargetId}/delete`)
                .type('form')
                .send({
                    'api_key': '5e891347eee2344b44a1c6bd'
                })
                .expect(401)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        }).timeout(5000);
    });
});


//5e891347eee2794b40a1c6bd
