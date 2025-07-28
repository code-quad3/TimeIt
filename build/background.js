// In-memory cache to reduce frequent reads
let timeData = {};

// Load on startup
browser.runtime.onStartup.addListener(async () => {
  const stored = await browser.storage.local.get("timeData");
  timeData = stored.timeData || {};
});

// Save updated time to storage
async function updateTime(date, seconds) {
  timeData[date] = (timeData[date] || 0) + seconds;
  await browser.storage.local.set({ timeData });
}

browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "updateTime") {
    return updateTime(message.date, message.seconds);
  }

  if (message.action === "getTime") {
    return Promise.resolve(timeData);
  }
});
