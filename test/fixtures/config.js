const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

const userOne = {
  name: 'Pikachu',
  email: 'pika@example.com',
  password: 'test1234',
  passwordConfirm: 'test1234',
};

const userTwo = {
  name: 'Bulbasaur',
  email: 'bulba@example.com',
  password: 'test1234',
  passwordConfirm: 'test1234',
};

let token;
let id;
let bookOneId;
let bookTwoId;
let bookThreeId;

module.exports = {
  DB,
  userOne,
  userTwo,
  token,
  id,
  bookOneId,
  bookTwoId,
  bookThreeId,
};
