const mongoose = require('mongoose');

const booksSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A book must have a name.'],
    unique: true,
    trim: true,
    maxlength: [50, 'A book name must be less than 50 characters.'],
    minlength: [1, 'A book name must be 10 or more characters.'],
  },
  pageCount: {
    type: Number,
    required: [true, 'You need to provide number of pages this book has.'],
  },
  publishedDate: {
    type: Date,
  },
  thumbnailUrl: {
    type: String,
  },
  shortDescription: {
    type: String,
    required: [true, 'A book must have a short description.'],
    maxlength: [100, 'Short description must be less than 100 characters.'],
  },
  longDescription: {
    type: String,
    required: [true, 'A book must have a long description.'],
  },
  status: {
    type: String,
    required: [true, 'A book must have a status.'],
    enum: {
      values: ['PUBLISHED', 'NOT PUBLISHED'],
      message: 'Difficulty is either: PUBLISHED or NOT PUBLISHED.',
    },
  },
  authors: {
    type: [String],
  },
});

const Book = mongoose.model('Book', booksSchema);

module.exports = Book;
