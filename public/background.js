let timeData = {};
let domainTimeData = {};

let lastTracked = {
  date: null,
  week: null,
  month: null,
};

// --- IndexedDB Constants and Functions ---
const DB_NAME = "FaviconDB";
const DB_VERSION = 1;
const STORE_NAME = "favicons";

let db;

function openFaviconDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "domain" });
        // --- DEBUG: Log DB creation ---
        console.log(
          `[background.js] IndexedDB object store '${STORE_NAME}' created.`
        );
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      // --- DEBUG: Log DB opening success ---
      console.log(
        `[background.js] IndexedDB '${DB_NAME}' opened successfully.`
      );
      resolve(db);
    };

    request.onerror = (event) => {
      // --- DEBUG: Log DB opening error ---
      console.error(
        "[background.js] Error opening IndexedDB:",
        event.target.errorCode,
        event.target.error
      );
      reject(event.target.errorCode);
    };
  });
}

async function saveFavicon(domain, iconArray) {
  if (!db) {
    // --- DEBUG: Attempting to open DB if not already open ---
    console.warn(
      "[background.js] DB not open when trying to save favicon, attempting to open now."
    );
    db = await openFaviconDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({
      domain: domain,
      icon: iconArray,
      updatedAt: Date.now(),
    });

    request.onsuccess = () => {
      // --- DEBUG: Log favicon save success ---
      console.log(`[background.js] Favicon for ${domain} saved to IndexedDB.`);
      resolve();
    };

    request.onerror = (event) => {
      // --- DEBUG: Log favicon save error ---
      console.error(
        `[background.js] Error saving favicon for ${domain} to IndexedDB:`,
        event.target.errorCode,
        event.target.error
      );
      reject(event.target.errorCode);
    };
  });
}

// Load existing data and open DB on startup
browser.runtime.onStartup.addListener(async () => {
  // --- DEBUG: Log startup event ---
  console.log("[background.js] Extension starting up.");

  const stored = await browser.storage.local.get([
    "timeData",
    "domainTimeData",
  ]);
  timeData = stored.timeData || {};
  domainTimeData = stored.domainTimeData || {};
  // --- DEBUG: Log loaded data ---
  console.log(
    "[background.js] Loaded timeData from storage:",
    JSON.stringify(timeData)
  );
  console.log(
    "[background.js] Loaded domainTimeData from storage:",
    JSON.stringify(domainTimeData)
  );

  // Open IndexedDB
  try {
    db = await openFaviconDB();
  } catch (error) {
    console.error(
      "[background.js] Failed to open IndexedDB on startup:",
      error
    );
  }
});

async function updateTime(date, seconds) {
  timeData[date] = (timeData[date] || 0) + seconds;
  await browser.storage.local.set({ timeData });
  // --- DEBUG: Log general time update ---
  console.log(
    `[background.js] Updated total time for ${date}: ${timeData[date]} seconds.`
  );
}

async function updateDomainTime(
  domain,
  date,
  week,
  month,
  seconds,
  icon = null
) {
  // --- DEBUG: Log domain time update call ---
  console.log(
    `[background.js] Called updateDomainTime for domain: ${domain}, date: ${date}, seconds: ${seconds}, iconPresent: ${!!icon}`
  );

  cleanupOldPeriods(date, week, month);

  if (!domainTimeData[domain]) {
    domainTimeData[domain] = { daily: {}, weekly: {}, monthly: {} };
    // --- DEBUG: Log new domain entry ---
    console.log(`[background.js] Created new entry for domain: ${domain}`);
  }

  domainTimeData[domain].daily[date] =
    (domainTimeData[domain].daily[date] || 0) + seconds;
  domainTimeData[domain].weekly[week] =
    (domainTimeData[domain].weekly[week] || 0) + seconds;
  domainTimeData[domain].monthly[month] =
    (domainTimeData[domain].monthly[month] || 0) + seconds;

  await browser.storage.local.set({ domainTimeData });
  // --- DEBUG: Log domain time storage ---
  console.log(
    `[background.js] Updated domain time for ${domain}. Daily: ${
      domainTimeData[domain].daily[date] || 0
    }`
  );

  if (icon && icon.length > 0) {
    try {
      await saveFavicon(domain, icon);
    } catch (error) {
      console.warn(
        `[background.js] Could not save favicon for ${domain}:`,
        error
      );
    }
  }
}

function cleanupOldPeriods(currentDate, currentWeek, currentMonth) {
  if (
    lastTracked.date !== currentDate ||
    lastTracked.week !== currentWeek ||
    lastTracked.month !== currentMonth
  ) {
    // --- DEBUG: Log cleanup initiation ---
    console.log(
      `[background.js] Initiating cleanup. Old: ${JSON.stringify(
        lastTracked
      )}, New: ${currentDate}, ${currentWeek}, ${currentMonth}`
    );
    for (const domain in domainTimeData) {
      if (lastTracked.date && domainTimeData[domain].daily[lastTracked.date]) {
        delete domainTimeData[domain].daily[lastTracked.date];
        console.log(
          `[background.js] Cleaned up daily data for ${domain} on ${lastTracked.date}`
        );
      }
      if (lastTracked.week && domainTimeData[domain].weekly[lastTracked.week]) {
        delete domainTimeData[domain].weekly[lastTracked.week];
        console.log(
          `[background.js] Cleaned up weekly data for ${domain} on ${lastTracked.week}`
        );
      }
      if (
        lastTracked.month &&
        domainTimeData[domain].monthly[lastTracked.month]
      ) {
        delete domainTimeData[domain].monthly[lastTracked.month];
        console.log(
          `[background.js] Cleaned up monthly data for ${domain} on ${lastTracked.month}`
        );
      }
    }
    lastTracked = { date: currentDate, week: currentWeek, month: currentMonth };
    console.log(
      `[background.js] Cleanup complete. lastTracked updated to: ${JSON.stringify(
        lastTracked
      )}`
    );
  }
}

// Handle messages
browser.runtime.onMessage.addListener((message, sender) => {
  // --- DEBUG: Log incoming message ---
  console.log(
    `[background.js] Message received: action=${message.action}, from tabId=${
      sender.tab ? sender.tab.id : "N/A"
    }`
  );

  if (message.action === "updateTime") {
    return updateTime(message.date, message.seconds);
  }

  if (message.action === "updateDomainTimeWithIcon") {
    return updateDomainTime(
      message.domain,
      message.date,
      message.week,
      message.month,
      message.seconds,
      message.icon
    );
  }

  if (message.action === "getTime") {
    // --- DEBUG: Log 'getTime' request and response ---
    console.log(
      `[background.js] Responding to 'getTime' request with:`,
      JSON.stringify(timeData)
    );
    return Promise.resolve(timeData);
  }

  if (message.action === "getDomainTime") {
    // --- DEBUG: Log 'getDomainTime' request and response ---
    console.log(
      `[background.js] Responding to 'getDomainTime' request with:`,
      JSON.stringify(domainTimeData)
    );
    return Promise.resolve(domainTimeData);
  }
});
