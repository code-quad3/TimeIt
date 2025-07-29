let timeData = {}; // Your original per-day total
let domainTimeData = {}; // New: { domain: { daily: {}, weekly: {}, monthly: {} } }

let lastTracked = {
  date: null,
  week: null,
  month: null,
};

// Load existing data
browser.runtime.onStartup.addListener(async () => {
  const stored = await browser.storage.local.get(["timeData", "domainTimeData"]);
  timeData = stored.timeData || {};
  domainTimeData = stored.domainTimeData || {};
});

// Your existing logic (unchanged)
async function updateTime(date, seconds) {
  timeData[date] = (timeData[date] || 0) + seconds;
  await browser.storage.local.set({ timeData });
}

// New logic for domain-level tracking
async function updateDomainTime(domain, date, week, month, seconds) {
  cleanupOldPeriods(date, week, month);

  if (!domainTimeData[domain]) {
    domainTimeData[domain] = { daily: {}, weekly: {}, monthly: {} };
  }

  domainTimeData[domain].daily[date] = (domainTimeData[domain].daily[date] || 0) + seconds;
  domainTimeData[domain].weekly[week] = (domainTimeData[domain].weekly[week] || 0) + seconds;
  domainTimeData[domain].monthly[month] = (domainTimeData[domain].monthly[month] || 0) + seconds;

  await browser.storage.local.set({ domainTimeData });
}

// Clear previous periods to avoid data bloat
function cleanupOldPeriods(currentDate, currentWeek, currentMonth) {
  if (
    lastTracked.date !== currentDate ||
    lastTracked.week !== currentWeek ||
    lastTracked.month !== currentMonth
  ) {
    for (const domain in domainTimeData) {
      if (lastTracked.date) delete domainTimeData[domain].daily[lastTracked.date];
      if (lastTracked.week) delete domainTimeData[domain].weekly[lastTracked.week];
      if (lastTracked.month) delete domainTimeData[domain].monthly[lastTracked.month];
    }
    lastTracked = { date: currentDate, week: currentWeek, month: currentMonth };
  }
}

// Handle messages
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "updateTime") {
    return updateTime(message.date, message.seconds);
  }

  if (message.action === "updateDomainTime") {
    return updateDomainTime(message.domain, message.date, message.week, message.month, message.seconds);
  }

  if (message.action === "getTime") {
    return Promise.resolve(timeData);
  }

  if (message.action === "getDomainTime") {
    return Promise.resolve(domainTimeData);
  }
});
