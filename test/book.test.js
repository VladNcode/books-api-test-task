require('dotenv').config({ path: './test.env' });
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Book = require('../models/bookModel');

let { DB, userTwo, tokenBook, bookOneId, bookTwoId } = require('./fixtures/config');

//* Connect to the database
beforeAll(async () => {
  await mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await mongoose.connection.db.dropDatabase();

  await User.create(userTwo);

  const user = await request(app)
    .post('/api/v1/users/login')
    .send({ email: 'bulba@example.com', password: 'test1234' });

  tokenBook = user.body.token;
});

beforeEach(async () => {
  const bookOne = await request(app)
    .post('/api/v1/books/')
    .send({
      title: 'test book one',
      pageCount: 200,
      publishedDate: '11.05.2009',
      shortDescription: 'test book one short description',
      longDescription: 'test book one long description',
      status: 'PUBLISHED',
      authors: ['test', 'test2', 'test3'],
    })
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(201);

  const bookTwo = await request(app)
    .post('/api/v1/books/')
    .send({
      title: 'test book two',
      pageCount: 200,
      publishedDate: '11.05.2009',
      shortDescription: 'test book two short description',
      longDescription: 'test book two long description',
      status: 'PUBLISHED',
      authors: ['test', 'test2', 'test3'],
    })
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(201);

  const bookThree = await request(app)
    .post('/api/v1/books/')
    .send({
      title: 'test book three',
      pageCount: 201,
      publishedDate: '11.05.2009',
      shortDescription: 'test book three short description',
      longDescription: 'test book three long description',
      status: 'PUBLISHED',
      authors: ['test', 'test2', 'test3'],
    })
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(201);

  bookOneId = bookOne.body.data.book._id;
  bookTwoId = bookTwo.body.data.book._id;
  bookThreeId = bookThree.body.data.book._id;
});

afterEach(async () => {
  await Book.deleteMany({ pageCount: { $ne: 500 } });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

test('Should be able to create new book', async () => {
  const res = await request(app)
    .post('/api/v1/books/')
    .send({
      title: 'test book creation',
      pageCount: 200,
      publishedDate: '11.05.2009',
      thumbnailUrl: 'somerandimgurl.jpg',
      shortDescription: 'test book short description',
      longDescription: 'test book long description',
      status: 'PUBLISHED',
      authors: ['test', 'test2', 'test3'],
    })
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(201);

  const book = await Book.findById(res.body.data.book._id);
  expect(book.title).toEqual('test book creation');
});

test('Should NOT be able to create new book with invalid data', async () => {
  // Page count text instead of number
  await request(app)
    .post('/api/v1/books/')
    .send({
      title: 'wrong book creation',
      pageCount: 'text',
      publishedDate: '11.05.2009',
      thumbnailUrl: 'somerandimgurl.jpg',
      shortDescription: 'test book short description',
      longDescription: 'test book long description',
      status: 'PUBLISHED',
      authors: ['test', 'test2', 'test3'],
    })
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(400);

  // No title
  await request(app)
    .post('/api/v1/books/')
    .send({
      title: '',
      pageCount: 200,
      publishedDate: '11.05.2009',
      thumbnailUrl: 'somerandimgurl.jpg',
      shortDescription: 'test book short description',
      longDescription: 'test book long description',
      status: 'PUBLISHED',
      authors: ['test', 'test2', 'test3'],
    })
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(400);

  // Incorrect status
  await request(app)
    .post('/api/v1/books/')
    .send({
      title: 'wrong book creation',
      pageCount: 200,
      publishedDate: '11.05.2009',
      thumbnailUrl: 'somerandimgurl.jpg',
      shortDescription: 'test book short description',
      longDescription: 'test book long description',
      status: 'WRONG STATUS',
      authors: ['test', 'test2', 'test3'],
    })
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(400);

  const book = await Book.findOne({ shortDescription: 'test book short description' });
  expect(book).toBeNull();
});

test('Should NOT be able to create new book if unauthorized', async () => {
  await request(app)
    .post('/api/v1/books/')
    .send({
      title: 'test book creation',
      pageCount: 200,
      publishedDate: '11.05.2009',
      thumbnailUrl: 'somerandimgurl.jpg',
      shortDescription: 'test book short description',
      longDescription: 'test book long description',
      status: 'PUBLISHED',
      authors: ['test', 'test2', 'test3'],
    })
    .expect(401);

  const book = await Book.findOne({ title: 'test book creation' });
  expect(book).toBeNull();
});

test('Should be able to get one book', async () => {
  const res = await request(app)
    .get(`/api/v1/books/${bookOneId}`)
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(200);

  expect(res.body.data.book.title).toBe('test book one');
});

test('Should NOT be able to get one book if book id is incorrect', async () => {
  await request(app)
    .get(`/api/v1/books/1000000`)
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(400);
});

test('Should be able to update a book', async () => {
  await request(app)
    .patch(`/api/v1/books/${bookOneId}`)
    .send({
      title: 'updated title',
    })
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(200);

  const book = await Book.findOne({ title: 'updated title' });
  expect(book.title).toBe('updated title');
});

test('Should NOT be able to update a book if unauthorized', async () => {
  await request(app)
    .patch(`/api/v1/books/${bookOneId}`)
    .send({
      title: 'updated title fail',
    })
    .expect(401);

  const book = await Book.findOne({ title: 'updated title fail' });
  expect(book).toBeNull();
});

test('Should be able to delete a book', async () => {
  await request(app)
    .delete(`/api/v1/books/${bookTwoId}`)
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(204);

  const book = await Book.findOne({ title: 'test book two' });
  expect(book).toBeNull();
});

test('Should NOT be able to delete a book if unauthorized', async () => {
  await request(app).delete(`/api/v1/books/${bookTwoId}`).expect(401);

  const book = await Book.findOne({ title: 'test book two' });
  expect(book).not.toBeNull();
});

test('Should NOT be able to delete a book if id is incorrect', async () => {
  await request(app).delete(`/api/v1/books/1000000`).expect(401);

  const book = await Book.find();
  expect(book.length).toBe(3);
});

test('Should be able to get multiple books', async () => {
  const res = await request(app)
    .get('/api/v1/books/')
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(200);

  expect(res.body.data.books.length).toBe(3);
});

test('Should NOT be able to get multiple books if unauthorized', async () => {
  await request(app).get('/api/v1/books/').expect(401);
});

test('Should be able to use filter, sort, pagination and limit fields', async () => {
  // Pagination
  let res = await request(app)
    .get('/api/v1/books/?limit=2&page=2')
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(200);

  expect(res.body.data.books.length).toBe(1);

  // Sorting
  res = await request(app)
    .get('/api/v1/books/?sort=title')
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(200);

  expect(res.body.data.books[0].title).toBe('test book one');

  res = await request(app)
    .get('/api/v1/books/?sort=-title')
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(200);

  expect(res.body.data.books[0].title).toBe('test book two');

  // Limit fields
  res = await request(app)
    .get('/api/v1/books/?fields=title,pageCount')
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(200);

  expect(res.body.data.books[0].publishedDate).toBeFalsy();

  // Filtering
  res = await request(app)
    .get('/api/v1/books/?title=test book three')
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(200);

  expect(res.body.data.books.length).toBe(1);

  res = await request(app)
    .get('/api/v1/books/?pageCount[lte]=200')
    .set('Authorization', 'Bearer ' + tokenBook)
    .expect(200);

  expect(res.body.data.books.length).toBe(2);
});
