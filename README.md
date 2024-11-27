# Spotify Time Capsule

Automatically archives your Spotify listening history, creating a comprehensive playlist of every song you've played. It's like a digital memory box for your musical journey, preserving a detailed record of your soundtrack through life.

## Why Use It?

Your Spotify history contains valuable personal data that can be useful for all kinds of reasons:

- Nostalgia: Look back on the tunes you were loving at different points in your life.
- Discover Trends: Analyze your listening habits to uncover preferences and rediscover forgotten favorites.
- Share with Others: Show friends and family the shitty taste in music you had during a given time
- Backup and Preserve: Keep your listening history safe, even if your account ever gets deleted.

## Key Features

- 🎵 Real-time tracking of your Spotify listening activity
- 📊 Detailed song metadata storage (title, artist, album, timestamp)
- 📝 Automatic playlist generation of your complete listening history
- 🔒 Secure and private data storage in your personal MongoDB database

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Spotify Premium account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/spotify-time-capsule.git
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Configure environment variables
   ```env
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   MONGODB_URI=your_mongodb_uri
   ```
