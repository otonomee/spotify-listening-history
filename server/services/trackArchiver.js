// server/services/trackArchiver.js
const cron = require("node-cron");
const User = require("../models/User");
const ListeningHistory = require("../models/ListeningHistory");
const SpotifyWebApi = require("spotify-web-api-node");

async function getOrCreateMasterPlaylist(spotifyApi) {
  const playlists = await spotifyApi.getUserPlaylists({ limit: 50 });
  console.log(
    "playlists",
    playlists.body.items.map((p) => p.name)
  );

  let masterPlaylist = playlists.body.items.find((p) => p.name === "Complete Listening History");

  if (!masterPlaylist) {
    console.log("Creating master playlist...");
    const created = await spotifyApi.createPlaylist("Complete Listening History", {
      description: "Archive of all tracks listened to",
      public: false,
    });
    masterPlaylist = created.body;
  } else {
    console.log("Found existing master playlist:", masterPlaylist.name);
  }

  return masterPlaylist;
}

// Add a timestamp to logs
function log(...args) {
  console.log(`[Track Archiver ${new Date().toLocaleTimeString()}]`, ...args);
}

const cronSchedule = "*/10 * * * * *";
log(`Initializing with schedule: ${cronSchedule}`);

const job = cron.schedule(cronSchedule, async () => {
  log("=== Starting New Track Check ===");
  try {
    const users = await User.find({});
    log(`Found ${users.length} users to process`);

    if (users.length === 0) {
      log("No users found in database. Waiting for next check.");
      return;
    }

    for (const user of users) {
      log(`Processing user: ${user.spotifyId}`);
      try {
        const spotifyApi = new SpotifyWebApi({
          clientId: process.env.SPOTIFY_CLIENT_ID,
          clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        });

        spotifyApi.setAccessToken(user.accessToken);
        spotifyApi.setRefreshToken(user.refreshToken);

        // Get latest track we have in our database
        const lastStoredTrack = await ListeningHistory.findOne({ userId: user.spotifyId }, { trackName: 1, timestamp: 1 }).sort({ timestamp: -1 });

        log(
          "Last stored track:",
          lastStoredTrack
            ? {
                name: lastStoredTrack.trackName,
                timestamp: lastStoredTrack.timestamp?.toISOString(),
              }
            : "None"
        );

        let after = 0;
        if (lastStoredTrack && lastStoredTrack.timestamp) {
          after = Math.floor(new Date(lastStoredTrack.timestamp).getTime() / 1000) + 1;
          log(`Using last track timestamp: ${after} (${new Date(after * 1000).toISOString()})`);
        }

        log(`Fetching tracks after: ${new Date(after * 1000).toISOString()}`);

        const recentTracks = await spotifyApi.getMyRecentlyPlayedTracks({
          after,
          limit: 50,
        });

        log(`API Response contains ${recentTracks.body.items.length} tracks`);
        if (recentTracks.body.items.length > 0) {
          log(`Found ${recentTracks.body.items.length} potential new tracks`);
          log("First track:", {
            name: recentTracks.body.items[0].track.name,
            played_at: recentTracks.body.items[0].played_at,
            total_tracks: recentTracks.body.items.length,
          });
          log("Last track:", {
            name: recentTracks.body.items[recentTracks.body.items.length - 1].track.name,
            played_at: recentTracks.body.items[recentTracks.body.items.length - 1].played_at,
          });

          // Get master playlist
          const masterPlaylist = await getOrCreateMasterPlaylist(spotifyApi);

          // Sort tracks by played_at to ensure we process oldest first
          const sortedTracks = recentTracks.body.items.sort((a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime());

          // Format tracks for storage
          const tracks = sortedTracks.map((item) => ({
            userId: user.spotifyId,
            trackId: item.track.id,
            trackName: item.track.name,
            artistName: item.track.artists[0].name,
            albumName: item.track.album.name,
            timestamp: new Date(item.played_at),
            uri: item.track.uri,
            duration: item.track.duration_ms,
          }));

          let savedCount = 0;
          for (const track of tracks) {
            try {
              // Only save if we don't already have this exact play
              const exists = await ListeningHistory.findOne({
                userId: track.userId,
                trackId: track.trackId,
                timestamp: track.timestamp,
              });

              if (!exists) {
                log(`Adding new track: ${track.trackName} (played at: ${track.timestamp.toISOString()})`);
                await ListeningHistory.create(track);
                savedCount++;

                // Add to master playlist
                try {
                  await spotifyApi.addTracksToPlaylist(masterPlaylist.id, [track.uri]);
                  log(`Added to playlist: ${track.trackName}`);
                } catch (addTrackError) {
                  log(`Error adding track to playlist: ${track.trackName}`, addTrackError.message);
                }
              } else {
                log(`Skipping duplicate track: ${track.trackName} (played at: ${track.timestamp.toISOString()})`);
              }
            } catch (error) {
              log(`Error processing track ${track.trackName}:`, error.message);
            }
          }

          log(`=== Finished processing user ${user.spotifyId} ===`);
          log(`Added ${savedCount} new tracks to archive`);
        } else {
          log(`No new tracks found for user ${user.spotifyId}`);
        }
      } catch (error) {
        log(`Error processing user ${user.spotifyId}:`, error.message);
      }
    }
    log("=== Track Check Complete ===");
  } catch (error) {
    log("Track check error:", error.message);
  }
});

// Start the job
job.start();
log("Service initialized and started");

module.exports = {
  getOrCreateMasterPlaylist,
  job,
  checkNewTracks: async () => {
    log("Manually triggering track check...");
    const users = await User.find({});
    // ... rest of the logic ...
  },
};
