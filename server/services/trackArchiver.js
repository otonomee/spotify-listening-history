// server/services/trackArchiver.js
const cron = require("node-cron");
const User = require("../models/User");
const ListeningHistory = require("../models/ListeningHistory");
const { getValidSpotifyApi } = require("./tokenManager");

// Function to archive recently played tracks
async function archiveRecentTracks(spotifyApi, userId) {
  try {
    // Get latest stored track timestamp
    const lastTrack = await ListeningHistory.findOne({ userId }).sort({ playedAt: -1 });

    const after = lastTrack ? new Date(lastTrack.playedAt).getTime() : undefined;

    // Get recent tracks from Spotify
    const recentTracks = await spotifyApi.getMyRecentlyPlayedTracks({
      limit: 50,
      after,
    });

    // Format tracks for database
    const tracks = recentTracks.body.items.map((item) => ({
      userId,
      trackId: item.track.id,
      trackName: item.track.name,
      artistName: item.track.artists[0].name,
      albumName: item.track.album.name,
      playedAt: new Date(item.played_at),
      uri: item.track.uri,
      addedToMonthlyPlaylist: false,
      addedToMasterPlaylist: false,
    }));

    // Save to database
    if (tracks.length > 0) {
      await ListeningHistory.insertMany(tracks);
      console.log(`Archived ${tracks.length} new tracks for user ${userId}`);
    }

    return tracks;
  } catch (error) {
    console.error("Error archiving tracks:", error);
    throw error;
  }
}

// Function to create/update master playlist
async function updateMasterPlaylist(spotifyApi, userId, tracks) {
  try {
    // Find or create master playlist
    const playlists = await spotifyApi.getUserPlaylists();
    let masterPlaylist = playlists.body.items.find((p) => p.name === "Complete Listening History");

    if (!masterPlaylist) {
      const created = await spotifyApi.createPlaylist("Complete Listening History", {
        description: "Archive of all tracks from your listening history",
      });
      masterPlaylist = created.body;
    }

    // Add new tracks in batches of 100
    const trackUris = tracks.map((track) => track.uri);
    for (let i = 0; i < trackUris.length; i += 100) {
      const batch = trackUris.slice(i, i + 100);
      await spotifyApi.addTracksToPlaylist(masterPlaylist.id, batch);
    }

    // Mark tracks as added to master playlist
    await ListeningHistory.updateMany(
      {
        userId,
        trackId: { $in: tracks.map((t) => t.trackId) },
      },
      { addedToMasterPlaylist: true }
    );

    return masterPlaylist.id;
  } catch (error) {
    console.error("Error updating master playlist:", error);
    throw error;
  }
}

// Function to create monthly playlist
async function createMonthlyPlaylist(spotifyApi, userId) {
  try {
    // Get last month's date range
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(firstOfMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Get tracks from last month that haven't been added to a monthly playlist
    const monthlyTracks = await ListeningHistory.find({
      userId,
      playedAt: {
        $gte: lastMonth,
        $lt: firstOfMonth,
      },
      addedToMonthlyPlaylist: false,
    });

    if (monthlyTracks.length > 0) {
      // Create new playlist
      const playlistName = `Monthly Recap - ${lastMonth.toLocaleString("default", {
        month: "long",
        year: "numeric",
      })}`;

      const playlist = await spotifyApi.createPlaylist(playlistName, {
        description: `Tracks listened to in ${lastMonth.toLocaleString("default", { month: "long", year: "numeric" })}`,
      });

      // Add tracks in batches
      const trackUris = monthlyTracks.map((track) => track.uri);
      for (let i = 0; i < trackUris.length; i += 100) {
        const batch = trackUris.slice(i, i + 100);
        await spotifyApi.addTracksToPlaylist(playlist.id, batch);
      }

      // Mark tracks as added to monthly playlist
      await ListeningHistory.updateMany({ _id: { $in: monthlyTracks.map((t) => t._id) } }, { addedToMonthlyPlaylist: true });

      return playlist.id;
    }
  } catch (error) {
    console.error("Error creating monthly playlist:", error);
    throw error;
  }
}

// Initialize scheduled jobs
function initializeScheduledJobs() {
  // Archive tracks every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    try {
      const users = await User.find({});

      for (const user of users) {
        try {
          // Get fresh API instance with valid token
          const spotifyApi = await getValidSpotifyApi(user.spotifyId);

          // Archive tracks
          const tracks = await archiveRecentTracks(spotifyApi, user.spotifyId);

          // Update master playlist
          if (tracks.length > 0) {
            await updateMasterPlaylist(spotifyApi, user.spotifyId, tracks);
          }
        } catch (userError) {
          console.error(`Error processing user ${user.spotifyId}:`, userError);
          // Continue with next user
        }
      }
    } catch (error) {
      console.error("Track archival job error:", error);
    }
  });

  // Monthly playlist creation remains similar
  cron.schedule("0 0 1 * *", async () => {
    try {
      const users = await User.find({});

      for (const user of users) {
        try {
          const spotifyApi = await getValidSpotifyApi(user.spotifyId);
          await createMonthlyPlaylist(spotifyApi, user.spotifyId);
        } catch (userError) {
          console.error(`Error creating monthly playlist for ${user.spotifyId}:`, userError);
          // Continue with next user
        }
      }
    } catch (error) {
      console.error("Monthly playlist job error:", error);
    }
  });
}

module.exports = {
  archiveRecentTracks,
  updateMasterPlaylist,
  createMonthlyPlaylist,
  initializeScheduledJobs,
};
