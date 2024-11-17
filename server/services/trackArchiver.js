// server/services/trackArchiver.js
const ListeningHistory = require("../models/ListeningHistory");

async function getRecentTracks(spotifyApi, options = {}) {
  const {
    limit = 50, // Maximum allowed by API
    after, // Unix timestamp in ms
    before, // Unix timestamp in ms
  } = options;

  try {
    const params = {
      limit: Math.min(50, Math.max(1, limit)), // Ensure limit is between 1-50
    };

    // Can't use both after and before according to docs
    if (after) {
      params.after = after;
    } else if (before) {
      params.before = before;
    }

    const response = await spotifyApi.getMyRecentlyPlayedTracks(params);
    return response.body;
  } catch (error) {
    console.error("Error fetching recent tracks:", error);
    throw error;
  }
}

async function archiveRecentTracks(spotifyApi, userId) {
  try {
    // Get the latest track timestamp from our database
    const lastTrack = await ListeningHistory.findOne({ userId }).sort({ playedAt: -1 }).exec();

    const after = lastTrack ? new Date(lastTrack.playedAt).getTime() : undefined;

    const recentTracks = await getRecentTracks(spotifyApi, { after });

    // Format and save new tracks
    const tracks = recentTracks.items.map((item) => ({
      userId,
      trackId: item.track.id,
      trackName: item.track.name,
      artistName: item.track.artists[0].name,
      albumName: item.track.album.name,
      albumImage: item.track.album.images[0]?.url,
      playedAt: new Date(item.played_at),
      duration: item.track.duration_ms,
      context: item.context
        ? {
            type: item.context.type,
            uri: item.context.uri,
            url: item.context.external_urls?.spotify,
          }
        : null,
      trackUri: item.track.uri,
      isLocal: item.track.is_local,
      addedToMonthlyPlaylist: false,
      addedToMasterPlaylist: false,
    }));

    // Save tracks while avoiding duplicates
    const savedTracks = await Promise.all(
      tracks.map((track) =>
        ListeningHistory.findOneAndUpdate(
          {
            userId: track.userId,
            trackId: track.trackId,
            playedAt: track.playedAt,
          },
          track,
          {
            upsert: true,
            new: true,
          }
        )
      )
    );

    console.log(`Archived ${savedTracks.length} new tracks for user ${userId}`);

    // Return cursors for pagination
    return {
      tracks: savedTracks,
      cursors: recentTracks.cursors,
      total: recentTracks.total,
      next: recentTracks.next,
    };
  } catch (error) {
    console.error("Error archiving tracks:", error);
    throw error;
  }
}

// For paginated history retrieval
async function getArchivedTracks(userId, options = {}) {
  const { limit = 20, offset = 0, startDate, endDate } = options;

  const query = { userId };

  if (startDate || endDate) {
    query.playedAt = {};
    if (startDate) query.playedAt.$gte = new Date(startDate);
    if (endDate) query.playedAt.$lte = new Date(endDate);
  }

  try {
    const [tracks, total] = await Promise.all([
      ListeningHistory.find(query).sort({ playedAt: -1 }).skip(offset).limit(limit).exec(),
      ListeningHistory.countDocuments(query),
    ]);

    return {
      tracks,
      total,
      offset,
      limit,
      next: offset + tracks.length < total ? offset + limit : null,
    };
  } catch (error) {
    console.error("Error retrieving archived tracks:", error);
    throw error;
  }
}

module.exports = {
  archiveRecentTracks,
  getRecentTracks,
  getArchivedTracks,
};
