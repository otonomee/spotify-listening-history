const cron = require("node-cron");
const { createMonthlyPlaylist } = require("./playlistCreation");

// Schedule the job to run at the end of every month
cron.schedule("0 0 1 * *", async () => {
  console.log("Creating monthly playlist...");
  await createMonthlyPlaylist();
  console.log("Monthly playlist created.");
});
