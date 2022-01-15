require('dotenv').config({ path: './test.env' });
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
let { DB, userOne, userTwo, token, id } = require('./fixtures/config');

//* Connect to the server and  database
beforeAll(async () => {
  await mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await mongoose.connection.db.dropDatabase();
});

beforeEach(async () => {
  await User.create(userOne);

  const res = await request(app)
    .post('/api/v1/users/login')
    .send({ email: 'pika@example.com', password: 'test1234' });

  token = res.body.token;
  id = res.body.data.user._id;
});

afterEach(async () => {
  await User.deleteOne({ _id: id });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

test('Should be able to signup a new user', async () => {
  const res = await request(app).post('/api/v1/users/signup').send(userTwo).expect(201);
  const user = await User.findOne({ email: 'bulba@example.com' });

  // Checking if user is in DB
  expect(user).not.toBeNull();

  // Checking if password is hashed
  expect(user.password).not.toBe('test1234');

  // Checking if req contains correct info
  expect(res.body.data.user).toMatchObject({
    name: 'Bulbasaur',
    email: 'bulba@example.com',
  });
});

test('Should NOT able to signup a new user with invalid data', async () => {
  // No name provided
  await request(app)
    .post('/api/v1/users/signup')
    .send({
      name: '',
      email: 'incorrectemail',
      password: 'test1234',
      passwordConfirm: 'test1234',
    })
    .expect(400);

  // Invalid email
  await request(app)
    .post('/api/v1/users/signup')
    .send({
      name: 'wrongdatatest',
      email: 'incorrectemail',
      password: 'test1234',
      passwordConfirm: 'test1234',
    })
    .expect(400);

  // Passwords doesn't match
  await request(app)
    .post('/api/v1/users/signup')
    .send({
      name: 'wrongdatatest',
      email: 'incorrectemail@example.com',
      password: 'test1234',
      passwordConfirm: 'test12345',
    })
    .expect(400);

  // Password is less than 8 characters
  await request(app)
    .post('/api/v1/users/signup')
    .send({
      name: 'wrongdatatest',
      email: 'incorrectemail@example.com',
      password: 'test123',
      passwordConfirm: 'test123',
    })
    .expect(400);

  const user = await User.findOne({ name: 'wrongdatatest' });

  // Checking if user somehow still got to DB
  expect(user).toBeNull();
});

test('Should be able to login and token must be valid', async () => {
  const res = await request(app)
    .post('/api/v1/users/login')
    .send({ email: 'pika@example.com', password: 'test1234' })
    .expect(200);

  token = res.body.token;

  // Checking token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  expect(decoded.id).toEqual(res.body.data.user._id);
});

test('Should NOT be able to login with wrong credentials', async () => {
  await request(app)
    .post('/api/v1/users/login/')
    .send({ email: 'test@example.com', password: 'test12345' })
    .expect(401);
});
