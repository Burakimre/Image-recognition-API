let request = require('supertest');
let expect = require('chai').expect;
let should = require('chai').should();

let app = require('express')();
// example using routes
//let calendar = require('../routes/calendar');
//app.use('/', calendar);

function makeRequest(route, statusCode, done){
    request(app)
        .get(route)
        .expect(statusCode)
        .end(function(err, res){
            if(err){ return done(err); }

            done(null, res);
        });
}
