// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const UserAnime = require('./models/UserAnime');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Routes
app.post('/api/user-anime/:userId/anime', async (req, res) => {
  try {
    const { userId } = req.params;
    const { malId, title, image, genre, status } = req.body;
    
    if (!userId || !malId || !title || !status) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        received: { userId, malId, title, status }
      });
    }

    let userAnime = await UserAnime.findOne({ userId });

    if (!userAnime) {
      userAnime = new UserAnime({
        userId,
        animes: []
      });
    }

    // Check if anime already exists
    const animeIndex = userAnime.animes.findIndex(a => a.malId === malId);

    if (animeIndex > -1) {
      userAnime.animes[animeIndex].status = status;
    } else {
      userAnime.animes.push({
        malId,
        title,
        image,
        genre,
        status
      });
    }

    const savedUserAnime = await userAnime.save();
    return res.status(200).json({ 
      message: 'Anime updated successfully',
      data: savedUserAnime 
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get user's anime list
app.get('/api/user-anime/:userId', async (req, res) => {
  try {
    const userAnime = await UserAnime.findOne({ userId: req.params.userId });
    if (!userAnime) {
      return res.status(200).json({ animes: [] });
    }
    res.status(200).json(userAnime);
  } catch (error) {
    console.error('Error fetching user animes:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete anime from user's list
app.delete('/api/user-anime/:userId/anime/:malId', async (req, res) => {
  try {
    const { userId, malId } = req.params;
    
    const userAnime = await UserAnime.findOne({ userId });
    
    if (!userAnime) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the index of the anime to remove
    const animeIndex = userAnime.animes.findIndex(anime => anime.malId === malId);
    
    if (animeIndex === -1) {
      return res.status(404).json({ message: 'Anime not found in user\'s list' });
    }

    // Remove the anime from the array
    userAnime.animes.splice(animeIndex, 1);
    
    // Save the updated document
    await userAnime.save();

    return res.status(200).json({ 
      message: 'Anime removed successfully',
      data: userAnime
    });

  } catch (error) {
    console.error('Error deleting anime:', error);
    return res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));