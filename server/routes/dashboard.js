// server/routes/dashboard.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");

router.get("/", requireAuth, async (req, res) => {
  try {
    // Use req.spotifyApi that's added by the middleware
    const [profile, recentTracks] = await Promise.all([req.spotifyApi.getMe(), req.spotifyApi.getMyRecentlyPlayedTracks({ limit: 20 })]);

    res.send(`
      <h1>Welcome ${profile.body.display_name}</h1>
      <h2>Recently Played Tracks</h2>
      <ul>
        ${recentTracks.body.items
          .map(
            (item) => `
            <li>
              ${item.track.name} by ${item.track.artists[0].name}
              <small>(${new Date(item.played_at).toLocaleString()})</small>
            </li>
          `
          )
          .join("")}
      </ul>
      <div>
        <button onclick="location.href='/api/playlists/create-monthly'">
          Create Monthly Playlist
        </button>
        <a href="/auth/logout">Logout</a>
      </div>
    `);
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.redirect("/auth/login");
  }
});

module.exports = router;
