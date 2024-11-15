spotify-listening-history/
├── client/
│ ├── src/
│ │ ├── components/
│ │ │ ├── AuthButton.jsx # Spotify login button
│ │ │ ├── PlaylistCard.jsx # Display playlist info
│ │ │ └── HistoryList.jsx # Show listening history
│ │ ├── hooks/
│ │ │ └── useSpotifyAuth.js # Auth state management
│ │ ├── pages/
│ │ │ ├── Landing.jsx # Landing page we created
│ │ │ └── Dashboard.jsx # User's main interface
│ │ └── App.jsx # Root component
├── server/
│ ├── app.js # Your existing Express app
│ ├── models/
│ │ ├── ListeningHistory.js # Your model
│ │ └── User.js # User model we created
│ └── routes/
│ └── api/
│ ├── auth.js # Auth routes
│ ├── history.js # History endpoints
│ └── playlists.js # Playlist endpoints
