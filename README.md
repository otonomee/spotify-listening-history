# Spotify Monthly Playlister
Automatic playlist generation of complete listening history for a given month/year. Principally, I wanted to automate & make accessible to others the process that I'd (https://open.spotify.com/user/12163912742?si=02d1e4a6e9334fa6)[already been doing essentially for years.]

## Why Use It?
- Nostalgia: Look back on the tunes you were loving at different points in your life.
- Discover Trends: Analyze your listening habits to uncover preferences and rediscover forgotten favorites.
- Share with Others: Show friends and family the shitty taste in music you had during a given time

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
