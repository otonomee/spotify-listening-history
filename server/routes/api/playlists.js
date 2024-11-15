// server/routes/api/playlists.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');

// Get all monthly playlists
router.get('/monthly', requireAuth, async (req, res) => {
  try {
    const data = await req.spotifyApi.getUserPlaylists(req.session.userId);
    const monthlyPlaylists = data.body.items.filter(playlist => 
      playlist.name.startsWith('Monthly Playlist -')
    );
    res.json(monthlyPlaylists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// Create a new monthly playlist
router.post('/monthly', requireAuth, async (req, res) => {
  try {
    const date = new Date();
    const playlistName = `Monthly Playlist - ${date.toLocaleString('default', { 
      month: 'long', 
      year: 'numeric' 
    })}`;

    // Create playlist
    const playlist = await req.spotifyApi.createPlaylist(playlistName, { 
      description: 'Automatically generated monthly playlist' 
    });

    res.json(playlist.body);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

module.exports = router;
