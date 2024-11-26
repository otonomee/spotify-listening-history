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
  ); // Log all playlist names

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

// Run every 10 seconds for testing
cron.schedule("*/10 * * * * *", async () => {
  try {
    const users = await User.find({});
    console.log(`Checking for new tracks (${new Date().toLocaleTimeString()})`);

    for (const user of users) {
      try {
        const spotifyApi = new SpotifyWebApi({
          clientId: process.env.SPOTIFY_CLIENT_ID,
          clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        });

        spotifyApi.setAccessToken(user.accessToken);
        spotifyApi.setRefreshToken(user.refreshToken);

        // Get latest track we have in our database
        const lastStoredTrack = await ListeningHistory.findOne({ userId: user.spotifyId }).sort({ playedAt: -1 });

        let after = 0;
        if (lastStoredTrack && lastStoredTrack.playedAt) {
          after = new Date(lastStoredTrack.playedAt).getTime();
        }
        console.log(`Fetching tracks after: ${after} (${new Date(after).toISOString()})`);

        // Get recent tracks after our last stored track
        const recentTracks = await spotifyApi.getMyRecentlyPlayedTracks({
          after,
          limit: 50,
        });

        if (recentTracks.body.items.length > 0) {
          console.log(`Found ${recentTracks.body.items.length} new tracks`);

          // Get master playlist
          const masterPlaylist = await getOrCreateMasterPlaylist(spotifyApi);

          // Format tracks for storage
          const tracks = recentTracks.body.items.map((item) => ({
            userId: user.spotifyId,
            trackId: item.track.id,
            trackName: item.track.name,
            artistName: item.track.artists[0].name,
            albumName: item.track.album.name,
            playedAt: new Date(item.played_at),
            uri: item.track.uri,
          }));

          // Save to database and add to playlist
          for (const track of tracks) {
            // Only save if we don't already have this exact play
            const exists = await ListeningHistory.findOne({
              userId: track.userId,
              trackId: track.trackId,
              playedAt: track.playedAt,
            });

            if (!exists) {
              console.log(`Adding new track: ${track.trackName}`);
              await ListeningHistory.create(track);

              // Add to master playlist
              try {
                await spotifyApi.addTracksToPlaylist(masterPlaylist.id, [track.uri]);
                console.log(`Added track to playlist: ${track.trackName}`);
              } catch (addTrackError) {
                console.error(`Error adding track to playlist: ${track.trackName}`, addTrackError);
              }
            }
          }
        } else {
          console.log("No new tracks found");
        }
      } catch (error) {
        console.error(`Error processing user ${user.spotifyId}:`, error);
      }
    }
  } catch (error) {
    console.error("Track check error:", error);
  }
});

module.exports = { getOrCreateMasterPlaylist };
