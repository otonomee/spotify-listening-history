// runs scheduled job to create a monthly playlist
require("./scheduledJobs");

const ListeningHistory = require("./models/ListeningHistory");

async function createMonthlyPlaylist() {
  // Get the start and end dates of the previous month
  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

  // Retrieve the tracks played in the previous month from the database
  const monthlyTracks = await ListeningHistory.find({
    timestamp: { $gte: startDate, $lte: endDate },
  });

  // Extract the track IDs from the listening history
  const trackIds = monthlyTracks.map((entry) => entry.trackId);

  // Create a new playlist using the Spotify API
  const playlistName = `Monthly Playlist - ${startDate.toLocaleString("default", { month: "long" })} ${startDate.getFullYear()}`;
  const response = await spotifyApi.createPlaylist(playlistName, { public: true });
  const playlistId = response.body.id;

  // Add the tracks to the newly created playlist
  await spotifyApi.addTracksToPlaylist(playlistId, trackIds);
}

module.exports = { createMonthlyPlaylist };
