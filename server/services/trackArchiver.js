// server/services/trackArchiver.js
const cron = require("node-cron");
const User = require("../models/User");
const ListeningHistory = require("../models/ListeningHistory");
const SpotifyWebApi = require("spotify-web-api-node");

async function getOrCreateMasterPlaylist(spotifyApi) {
  const masterPlaylistName = "Time Capsule";

  const playlists = await spotifyApi.getUserPlaylists({ limit: 50 });
  let masterPlaylist = playlists.body.items.find((p) => p.name === masterPlaylistName);

  if (!masterPlaylist) {
    log(`Creating master playlist: ${masterPlaylistName}`);
    const created = await spotifyApi.createPlaylist(masterPlaylistName, {
      description: `Your complete listening archive, showcasing your listening activity.`,
      public: false,
    });
    masterPlaylist = created.body;
  }

  return masterPlaylist;
}

async function getOrCreateMonthlyPlaylist(spotifyApi) {
  const now = new Date();
  const playlistName = `📼 ${now.toLocaleString("default", { month: "short" })} '${now.getFullYear().toString().slice(2)}`;

  const playlists = await spotifyApi.getUserPlaylists({ limit: 50 });
  let monthlyPlaylist = playlists.body.items.find((p) => p.name === playlistName);

  if (!monthlyPlaylist) {
    log(`Creating new monthly playlist: ${playlistName}`);
    const created = await spotifyApi.createPlaylist(playlistName, {
      description: `Time Capsule: Your listening history from ${now.toLocaleString("default", {
        month: "long",
        year: "numeric",
      })}. Part of your complete listening archive - check out "📼 Complete Listening History" for your full musical timeline.`,
      public: false,
    });
    monthlyPlaylist = created.body;
  }

  return monthlyPlaylist;
}

// Add a timestamp to logs
function log(...args) {
  console.log(`[Track Archiver ${new Date().toLocaleTimeString()}]`, ...args);
}

const cronSchedule = "*/1 * * * *";
log(`Initializing with schedule: ${cronSchedule}`);

// Add this function to refresh the access token
async function refreshAccessToken(spotifyApi, user) {
  try {
    const data = await spotifyApi.refreshAccessToken();
    const newAccessToken = data.body["access_token"];
    const newRefreshToken = data.body["refresh_token"] || user.refreshToken; // Use existing if not provided

    // Update the user's tokens in the database
    await User.updateOne({ spotifyId: user.spotifyId }, { accessToken: newAccessToken, refreshToken: newRefreshToken });

    spotifyApi.setAccessToken(newAccessToken);
    spotifyApi.setRefreshToken(newRefreshToken);
    log(`Refreshed access token for user: ${user.spotifyId}`);
  } catch (error) {
    log(`Failed to refresh access token for user ${user.spotifyId}:`, error.message);
    throw error; // Rethrow to handle it in the main processing logic
  }
}

async function fetchRecentTracks(spotifyApi, user, after) {
  try {
    const recentTracks = await spotifyApi.getMyRecentlyPlayedTracks({
      after,
      limit: 50,
    });

    log(`API Response:`, recentTracks.body);
    log(`API Response contains ${recentTracks.body.items.length} tracks`);

    if (recentTracks.body.items.length > 0) {
      log(`Found ${recentTracks.body.items.length} potential new tracks`);

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
          log(`Checking track: ${track.trackName} (ID: ${track.trackId}, played at: ${track.timestamp.toISOString()})`);

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

            // Add to both playlists
            const masterPlaylist = await getOrCreateMasterPlaylist(spotifyApi);
            const monthlyPlaylist = await getOrCreateMonthlyPlaylist(spotifyApi);

            await spotifyApi.addTracksToPlaylist(masterPlaylist.id, [track.uri]);
            await spotifyApi.addTracksToPlaylist(monthlyPlaylist.id, [track.uri]);
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
    if (error.message.includes("access token expired")) {
      log(`Access token expired for user ${user.spotifyId}. Attempting to refresh...`);
      await refreshAccessToken(spotifyApi, user);
      // Retry fetching tracks after refreshing the token
      return await fetchRecentTracks(spotifyApi, user, after);
    } else {
      throw new Error(`Error fetching tracks for user ${user.spotifyId}: ${error.message}`);
    }
  }
}

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

        // Get the last stored track timestamp
        const lastStoredTrack = await ListeningHistory.findOne({ userId: user.spotifyId }, { trackName: 1, timestamp: 1 }).sort({ timestamp: -1 });
        let after = 0;
        if (lastStoredTrack && lastStoredTrack.timestamp) {
          after = Math.floor(new Date(lastStoredTrack.timestamp).getTime() / 1000) + 1; // Add 1 second
          log(`Using last track timestamp: ${after} (${new Date(after * 1000).toISOString()})`);
        }

        log(`Fetching tracks after: ${new Date(after * 1000).toISOString()}`);
        const recentTracks = await fetchRecentTracks(spotifyApi, user, after);

        // Process the fetched tracks...
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
  getOrCreateMonthlyPlaylist,
  job,
  checkNewTracks: async () => {
    log("Manually triggering track check...");
    const users = await User.find({});
    // ... rest of the logic ...
  },
};
