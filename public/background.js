// background.js

import {
    openFaviconDB,
    saveFavicon,
    getFavicon,
    cleanupOldFavicons,
    getDomainTimeEntry,
    saveDomainTimeEntry,
    getAllDomainTimeEntries,
    cleanupOldTimeEntries
} from "./db.js";

// Global data objects
let timeData = {
    daily: {},
    weekly: {},
    monthly: {}
};

// Last tracked period for cleanup
let lastTracked = {
    date: null,
    week: null,
    month: null,
};

// Open the database and load data on startup
browser.runtime.onStartup.addListener(async () => {
    console.log("[background.js] Extension starting up.");

    const stored = await browser.storage.local.get(["timeData", "lastTracked"]);
    timeData = stored.timeData || { daily: {}, weekly: {}, monthly: {} };
    lastTracked = stored.lastTracked || {
        date: null,
        week: null,
        month: null
    };

    console.log("[background.js] Loaded timeData from storage:", JSON.stringify(timeData));
    console.log("[background.js] Loaded lastTracked from storage:", JSON.stringify(lastTracked));

    try {
        await openFaviconDB();
        await cleanupOldDataOnStartup();
    } catch (error) {
        console.error("[background.js] Failed to open IndexedDB or perform startup cleanup:", error);
    }
});

// Listener for messages from content scripts or popup
browser.runtime.onMessage.addListener((message, sender) => {
    console.log(`[background.js] Message received: action=${message.action}`);

    if (message.action === "updateTime") {
        return updateTime(message.date, message.week, message.month, message.seconds);
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
        return Promise.resolve(timeData);
    }
    if (message.action === "getDomainTime") {
        return getAllDomainTimeEntries();
    }
    if (message.action === "getFavicon") {
        return getFavicon(message.domain);
    }
});

async function updateTime(date, week, month, seconds) {
    timeData.daily[date] = (timeData.daily[date] || 0) + seconds;
    timeData.weekly[week] = (timeData.weekly[week] || 0) + seconds;
    timeData.monthly[month] = (timeData.monthly[month] || 0) + seconds;
    await browser.storage.local.set({
        timeData
    });
    console.log(`[background.js] Updated total time for ${date}: ${timeData.daily[date]} seconds.`);
}

async function updateDomainTime(domain, date, week, month, seconds, icon = null) {
    await cleanupOldPeriods(date, week, month);

    let domainData = await getDomainTimeEntry(domain);
    
    // Update the time data
    domainData.daily[date] = (domainData.daily[date] || 0) + seconds;
    domainData.weekly[week] = (domainData.weekly[week] || 0) + seconds;
    domainData.monthly[month] = (domainData.monthly[month] || 0) + seconds;

    await saveDomainTimeEntry(domain, domainData);
    console.log(`[background.js] Updated domain time for ${domain}. Daily: ${domainData.daily[date]}`);

    if (icon && icon.length > 0) {
        try {
            await saveFavicon(domain, icon);
        } catch (error) {
            console.warn(`[background.js] Could not save favicon for ${domain}:`, error);
        }
    }
}

async function cleanupOldPeriods(currentDate, currentWeek, currentMonth) {
    if (lastTracked.date !== currentDate || lastTracked.week !== currentWeek || lastTracked.month !== currentMonth) {
        console.log(`[background.js] Initiating cleanup. Old: ${JSON.stringify(lastTracked)}, New: ${currentDate}, ${currentWeek}, ${currentMonth}`);

        // Cleanup daily, weekly, and monthly data for total time
        if (lastTracked.date && timeData.daily[lastTracked.date] && lastTracked.date !== currentDate) {
            delete timeData.daily[lastTracked.date];
        }
        if (lastTracked.week && timeData.weekly[lastTracked.week] && lastTracked.week !== currentWeek) {
            delete timeData.weekly[lastTracked.week];
        }
        if (lastTracked.month && timeData.monthly[lastTracked.month] && lastTracked.month !== currentMonth) {
            delete timeData.monthly[lastTracked.month];
        }

        // Cleanup domain time data in IndexedDB
        const allDomains = await getAllDomainTimeEntries();
        for (const domainData of allDomains) {
            if (lastTracked.date && domainData.daily[lastTracked.date] && lastTracked.date !== currentDate) {
                delete domainData.daily[lastTracked.date];
            }
            if (lastTracked.week && domainData.weekly[lastTracked.week] && lastTracked.week !== currentWeek) {
                delete domainData.weekly[lastTracked.week];
            }
            if (lastTracked.month && domainData.monthly[lastTracked.month] && lastTracked.month !== currentMonth) {
                delete domainData.monthly[lastTracked.month];
            }
            await saveDomainTimeEntry(domainData.domain, domainData);
        }

        lastTracked = {
            date: currentDate,
            week: currentWeek,
            month: currentMonth
        };
        await browser.storage.local.set({
            lastTracked
        });
        console.log(`[background.js] Cleanup complete. lastTracked updated to: ${JSON.stringify(lastTracked)}`);
    }
}

async function cleanupOldDataOnStartup() {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Cleanup timeData (in browser.storage)
    const oldTimeDataDaily = Object.keys(timeData.daily).filter(date => date < ninetyDaysAgo);
    oldTimeDataDaily.forEach(date => delete timeData.daily[date]);
    await browser.storage.local.set({
        timeData
    });

    // Cleanup domain time data (in IndexedDB)
    await cleanupOldTimeEntries(ninetyDaysAgo);

    // Cleanup favicons (in IndexedDB)
    await cleanupOldFavicons(90);

    console.log("[background.js] Startup cleanup routine finished.");
}