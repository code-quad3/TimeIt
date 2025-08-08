// background.js

import {
  openFaviconDB,
  saveFavicon,
  getFavicon as getFaviconFromDB, // Renamed to avoid conflict
  cleanupOldFavicons,
  getDomainTimeEntry,
  saveDomainTimeEntry,
  getAllDomainTimeEntries,
  cleanupOldTimeEntries,
} from "./db.js";

import { getSimplifiedDomainName } from "../src/stats/utils/getSimplifiedDomainName.js";
import { getFullDomain } from "../src/stats/utils/getFullDomain.js";
// Global data objects
let timeData = {
  daily: {},
  weekly: {},
  monthly: {},
};

// Last tracked period for cleanup
let lastTracked = {
  date: null,
  week: null,
  month: null,
};

// This object will act as our temporary database to store time and icons.
let domainTimeData = {};

/**
 * Fetches the favicon for a given domain from Google's favicon API.
 * This function must be in the background script to avoid CSP errors.
 * @param {string} domain - The domain name (e.g., "google.com").
 * @returns {Promise<string|null>} A promise that resolves to the Base64-encoded icon string or null if fetching fails.
 */
async function getFavicon(domain) {
  console.log(`[background.js] Attempting to fetch favicon for: ${domain}`);
  try {
    // Construct the favicon URL with the provided domain.
    // The domain must be a valid, complete hostname like "google.com"
    const faviconUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    console.log(faviconUrl);
    const response = await fetch(faviconUrl);

    if (!response.ok) {
      console.warn(
        `[background.js] Could not fetch favicon for ${domain}: HTTP error! status: ${response.status}`
      );
      return null;
    }

    const blob = await response.blob();

    // Use a FileReader to convert the Blob to a Base64 string.
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // The result is a data URI, so we slice off the "data:image/..." part
        resolve(reader.result.split(",")[1]);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(
      `[background.js] Failed to fetch favicon for ${domain}:`,
      error
    );
    return null;
  }
}

/**
 * Updates the time for a given domain and fetches the favicon if it's new.
 * @param {string} domain - The domain to update.
 */
async function updateDomainTime(domain) {
  const baseDomain = getFullDomain(domain);      // e.g., home.edx.org → edx.org
  const keyDomain = getSimplifiedDomainName(baseDomain); // e.g., edx
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const week = `${now.getFullYear()}-W${Math.ceil(
    ((now - yearStart) / 86400000 + yearStart.getDay() + 1) / 7
  )}`;
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  timeData.daily[date] = (timeData.daily[date] || 0) + 1;
  timeData.weekly[week] = (timeData.weekly[week] || 0) + 1;
  timeData.monthly[month] = (timeData.monthly[month] || 0) + 1;

  let domainData = await getDomainTimeEntry(keyDomain);

  // Always ensure favicon exists
  const faviconExists = await getFaviconFromDB(keyDomain);
  if (!faviconExists) {
    const icon = await getFavicon(baseDomain);
    console.log(`[background.js] getFavicon(${baseDomain}) → ${icon ? 'success' : 'fail'}`);
    if (icon) await saveFavicon(keyDomain, icon);
  }

  if (!domainData) {
    domainData = { domain: keyDomain, daily: {}, weekly: {}, monthly: {} };
  }

  domainData.daily[date] = (domainData.daily[date] || 0) + 1;
  domainData.weekly[week] = (domainData.weekly[week] || 0) + 1;
  domainData.monthly[month] = (domainData.monthly[month] || 0) + 1;

  await saveDomainTimeEntry(keyDomain, domainData);

  console.log(`[background.js] Updated time for ${keyDomain}. Daily: ${domainData.daily[date]}`);

  await cleanupOldPeriods(date, week, month);
  await browser.storage.local.set({ timeData, lastTracked });
}

// Listener for messages from content scripts or popup
browser.runtime.onMessage.addListener(async (message) => {
  console.log(`[background.js] Message received: action=${message.action}`);
  const domain = getSimplifiedDomainName(message.domain);
  if (message.action === "updateActiveTab" && message.domain) {
    await updateDomainTime(message.domain);
  }
  // Added a separate message handler for when the popup requests data.
  if (message.action === "getDomainTime") {
    return getAllDomainTimeEntries();
  }
  if (message.action === "getFavicon") {
    return getFaviconFromDB(domain);
  }

  // You had `updateTime` and `updateDomainTimeWithIcon` here, but `updateActiveTab` handles both now.
  // The code below is for when the popup requests data.
  if (message.action === "getTime") {
    return Promise.resolve(timeData);
  }
});

async function cleanupOldPeriods(currentDate, currentWeek, currentMonth) {
  if (
    lastTracked.date !== currentDate ||
    lastTracked.week !== currentWeek ||
    lastTracked.month !== currentMonth
  ) {
    console.log(
      `[background.js] Initiating cleanup. Old: ${JSON.stringify(
        lastTracked
      )}, New: ${currentDate}, ${currentWeek}, ${currentMonth}`
    );

    // Cleanup daily, weekly, and monthly data for total time
    if (
      lastTracked.date &&
      timeData.daily[lastTracked.date] &&
      lastTracked.date !== currentDate
    ) {
      delete timeData.daily[lastTracked.date];
    }
    if (
      lastTracked.week &&
      timeData.weekly[lastTracked.week] &&
      lastTracked.week !== currentWeek
    ) {
      delete timeData.weekly[lastTracked.week];
    }
    if (
      lastTracked.month &&
      timeData.monthly[lastTracked.month] &&
      lastTracked.month !== currentMonth
    ) {
      delete timeData.monthly[lastTracked.month];
    }

    // Cleanup domain time data in IndexedDB
    const allDomains = await getAllDomainTimeEntries();
    for (const domainData of allDomains) {
      if (
        lastTracked.date &&
        domainData.daily[lastTracked.date] &&
        lastTracked.date !== currentDate
      ) {
        delete domainData.daily[lastTracked.date];
      }
      if (
        lastTracked.week &&
        domainData.weekly[lastTracked.week] &&
        lastTracked.week !== currentWeek
      ) {
        delete domainData.weekly[lastTracked.week];
      }
      if (
        lastTracked.month &&
        domainData.monthly[lastTracked.month] &&
        lastTracked.month !== currentMonth
      ) {
        delete domainData.monthly[lastTracked.month];
      }
      await saveDomainTimeEntry(domainData.domain, domainData);
    }

    lastTracked = {
      date: currentDate,
      week: currentWeek,
      month: currentMonth,
    };

    await browser.storage.local.set({ lastTracked, timeData });
    console.log(
      `[background.js] Cleanup complete. lastTracked updated to: ${JSON.stringify(
        lastTracked
      )}`
    );
  }
}

async function cleanupOldDataOnStartup() {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // Cleanup timeData (in browser.storage)
  const oldTimeDataDaily = Object.keys(timeData.daily).filter(
    (date) => date < ninetyDaysAgo
  );
  oldTimeDataDaily.forEach((date) => delete timeData.daily[date]);
  await browser.storage.local.set({ timeData });

  // Cleanup domain time data (in IndexedDB)
  await cleanupOldTimeEntries(ninetyDaysAgo);

  // Cleanup favicons (in IndexedDB)
  await cleanupOldFavicons(90);

  console.log("[background.js] Startup cleanup routine finished.");
}

// Open the database and load data on startup
browser.runtime.onStartup.addListener(async () => {
  console.log("[background.js] Extension starting up.");

  const stored = await browser.storage.local.get(["timeData", "lastTracked"]);
  timeData = stored.timeData || { daily: {}, weekly: {}, monthly: {} };
  lastTracked = stored.lastTracked || {
    date: null,
    week: null,
    month: null,
  };

  console.log(
    "[background.js] Loaded timeData from storage:",
    JSON.stringify(timeData)
  );
  console.log(
    "[background.js] Loaded lastTracked from storage:",
    JSON.stringify(lastTracked)
  );

  try {
    await openFaviconDB();
    await cleanupOldDataOnStartup();
  } catch (error) {
    console.error(
      "[background.js] Failed to open IndexedDB or perform startup cleanup:",
      error
    );
  }
});
