const app = require('../../app');
const request = require('supertest');
const User = require('../models/user');
const {userForTest, userForTestId, catForTest, catId, tourId, tourForTest } = require('./db');
const jwt = require('jsonwebtoken');
const Cat = require('../models/category');


beforeEach(async () => {
    await User.deleteMany();
    await User.create(userForTest);
    await Cat.create(catForTest);
})

test('should not register an account', async() => {
    await request(app).post("/users").send({
        "name": {
            "first": "Chinh",
            "last": "D. Le"
        },
        "password": 123456789,
        "passwordConfirm": 123456789,
        "email": "ldchinh@gmail.com"
    }).expect(400)
});

test('should login user', async() => {
    await request(app).post("/users/login")
    .send({
        "email": "ldchinh@gmail.com",
        "password": 123456789
    }).expect(200).then(res => expect(res.body.email).toBe('ldchinh@gmail.com'))
})

test('must be correct auth', async() => {
    await request(app).get('/users/profile/me')
    .set('Authorization', `Bearer ${userForTest.token[0]}`)
    .send()
    .expect(200).then(res => expect(res.body.data.email).toBe('ldchinh@gmail.com'))
})

test('should not be created category', async() => {
    await request(app).post('/cat')
        .send({
            "cat": 'North America',
            "description": "It's big region with 2 big countries.",
        })
        .expect(400)
})