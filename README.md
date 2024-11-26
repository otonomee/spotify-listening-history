# Spotify Listening History Archiver

Automatically archives your Spotify listening history, creating a comprehensive playlist of every song you've played. It's like a personal time capsule, preserving a detailed record of the music you've enjoyed over time.

## Why Use It?

Your Spotify history contains valuable personal data that can be useful for all kinds of reasons:

- Nostalgia: Look back on the tunes you were loving at different points in your life.
- Discover Trends: Analyze your listening habits to uncover preferences and rediscover forgotten favorites.
- Share with Others: Show friends and family the shitty taste in music you had during a given time
- Backup and Preserve: Keep your listening history safe, even if your account ever gets deleted.

## Key Features

- Continuously monitors your Spotify account for new tracks
- Saves detailed song info (title, artist, album, timestamp) to a database
- Maintains a dedicated "Complete Listening History" playlist on your Spotify

## Getting Started

Make sure you have Node.js and MongoDB installed.
Clone the repo and run npm install to set things up.
Add your Spotify API client ID and secret as environment variables.

The app uses the Spotify Web API to regularly check for new tracks you've played. It saves the details to a database and adds them to a special playlist on your account.
