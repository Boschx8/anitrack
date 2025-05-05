const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
  malId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['watching', 'completed', 'bookmarked'],
    required: true
  }
});

const userAnimeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  animes: [animeSchema]
}, { timestamps: true });

module.exports = mongoose.model('UserAnime', userAnimeSchema);