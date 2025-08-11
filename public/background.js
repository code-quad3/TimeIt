// background.js

import {
  openFaviconDB,
  saveFavicon,
  getFavicon as getFaviconFromDB,
  cleanupOldFavicons,
  getDomainTimeEntry,
  saveDomainTimeEntry,
  getAllDomainTimeEntries,
  cleanupOldTimeEntries,
  blockDomain,
  unblockDomain,
  getAllBlockedDomains,
  isDomainBlocked,
  clearAllData,
} from "./db.js";

import { getSimplifiedDomainName } from "../src/stats/utils/getSimplifiedDomainName.js";
import { getFullDomain } from "../src/stats/utils/getFullDomain.js";

// Global data objects
let timeData = {
  daily: {},
  weekly: {},
  monthly: {},
  rollingDaily: {},
};

// Last tracked period for cleanup
let lastTracked = {
  date: null,
  week: null,
  month: null,
};

/**
 * Fetches the favicon for a given domain from DuckDuckGo's favicon API.
 */
async function getFavicon(domain) {
  console.log(`[background.js] Attempting to fetch favicon for: ${domain}`);
  try {
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

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
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
 */
async function updateDomainTime(domain) {
  const baseDomain = getFullDomain(domain); // e.g., home.edx.org → edx.org
  const keyDomain = getSimplifiedDomainName(baseDomain); // e.g., edx
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const week = `${now.getFullYear()}-W${Math.ceil(
    ((now - yearStart) / 86400000 + yearStart.getDay() + 1) / 7
  )}`;
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;

  timeData.daily[date] = (timeData.daily[date] || 0) + 1;
  timeData.weekly[week] = (timeData.weekly[week] || 0) + 1;
  timeData.monthly[month] = (timeData.monthly[month] || 0) + 1;
  timeData.rollingDaily[date] = (timeData.rollingDaily[date] || 0) + 1;
  let domainData = await getDomainTimeEntry(keyDomain);

  // Always ensure favicon exists
  const faviconExists = await getFaviconFromDB(keyDomain);
  if (!faviconExists) {
    const icon = await getFavicon(baseDomain);
    console.log(
      `[background.js] getFavicon(${baseDomain}) → ${icon ? "success" : "fail"}`
    );
    if (icon) await saveFavicon(keyDomain, icon);
  }

  if (!domainData) {
    domainData = { domain: keyDomain, daily: {}, weekly: {}, monthly: {} };
  }

  domainData.daily[date] = (domainData.daily[date] || 0) + 1;
  domainData.weekly[week] = (domainData.weekly[week] || 0) + 1;
  domainData.monthly[month] = (domainData.monthly[month] || 0) + 1;

  await saveDomainTimeEntry(keyDomain, domainData);

  console.log(
    `[background.js] Updated time for ${keyDomain}. Daily: ${domainData.daily[date]}`
  );

  await cleanupOldPeriods(date, week, month);
  await browser.storage.local.set({ timeData, lastTracked });
}

// Listener for messages from content scripts or popup
browser.runtime.onMessage.addListener(async (message) => {
  console.log(`[background.js] Message received: action=${message.action}`);
  const domain = getSimplifiedDomainName(message.domain || "");

  if (message.action === "updateActiveTab" && message.domain) {
    await updateDomainTime(message.domain);
  }
  if (message.action === "getDomainTime") {
    return getAllDomainTimeEntries();
  }
  if (message.action === "getFavicon") {
    return getFaviconFromDB(domain);
  }
  if (message.action === "getTime") {
    return Promise.resolve(timeData);
  }

  // **NEW LOGIC ADDED HERE**
  if (message.action === "blockDomain" && message.domain) {
    console.log(`[background.js] Blocking domain: ${domain}`);
    await blockDomain(domain); // Save to the blocked list

    // Find the currently active tab
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs && tabs[0]) {
      const currentTab = tabs[0];
      try {
        const currentUrl = new URL(currentTab.url);
        const currentDomain = getSimplifiedDomainName(currentUrl.hostname);

        // If the current tab's domain matches the blocked domain, remove the tab
        if (currentDomain === domain) {
          console.log(
            `[background.js] Immediately removing active tab: ${currentTab.id} (${currentDomain})`
          );
          await browser.tabs.remove(currentTab.id);
        }
      } catch (err) {
        console.error("[background.js] Error processing current tab URL:", err);
      }
    }

    return { success: true };
  }

  if (message.action === "resetData") {
    console.log(
      "[background.js] Received resetData command. Clearing all data."
    );

    // Clear in-memory state
    timeData = { daily: {}, weekly: {}, monthly: {} };
    lastTracked = { date: null, week: null, month: null };

    try {
      // Clear browser local storage
      await browser.storage.local.clear();

      // Clear IndexedDB
      await clearAllData();

      console.log("[background.js] All data reset successfully.");
      return {
        success: true,
        message: "All data has been reset and tracking has started from zero.",
      };
    } catch (error) {
      console.error("[background.js] Error during data reset:", error);
      return { success: false, message: "Failed to reset data." };
    }
  }

  if (message.action === "unblockDomain" && message.domain) {
    await unblockDomain(domain);
    return { success: true };
  }
  if (message.action === "getBlockedList") {
    const list = getAllBlockedDomains();

    return list;
  }

  if (message.action === "isDomainBlocked" && message.domain) {
    return isDomainBlocked(domain);
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

    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);
    const oldDateThreshold = thirtyOneDaysAgo.toISOString().split("T")[0];

    for (const date in timeData.rollingDaily) {
      if (date < oldDateThreshold) {
        delete timeData.rollingDaily[date];
      }
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

// Use onBeforeRequest to check and block a domain before the tab even starts loading.
browser.webRequest.onBeforeRequest.addListener(
  async (details) => {
    // Only intercept main_frame requests to avoid blocking sub-resources
    if (details.type === "main_frame") {
      try {
        const url = new URL(details.url);
        const domain = getSimplifiedDomainName(url.hostname);
        const blocked = await isDomainBlocked(domain);
        if (blocked) {
          console.log(
            `[background.js] Blocking request for blocked domain: ${domain}`
          );
          return { cancel: true };
        }
      } catch (err) {
        console.error("[background.js] Failed to check domain block:", err);
      }
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

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
