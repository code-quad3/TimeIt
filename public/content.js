// content.js

let seconds = 0;
let iconFetched = false;

function getDomainName(hostname) {
    const parts = hostname.replace(/^www\./, "").split(".");
    if (parts.length > 2) {
        const tld = parts.pop();
        const secondLevel = parts.pop();
        if (["com", "org", "net", "gov", "edu", "co"].includes(tld)) {
            return parts.length > 0 ? parts.pop() + "." + secondLevel + "." + tld : secondLevel + "." + tld;
        }
        return secondLevel + "." + tld;
    }
    return hostname;
}

function getFaviconUrl() {
    const links = document.querySelectorAll('link[rel~="icon"]');
    if (links.length > 0) return links[0].href;
    return `${location.origin}/favicon.ico`;
}

// Single interval for all updates
const updateInterval = 1000; // 1 second
const iconFetchInterval = 60; // Fetch icon once every 60 seconds (60 * 1000ms)

let intervalCounter = 0;

console.log("Content script loaded on:", window.location.href);

setInterval(async () => {
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const week = `${now.getFullYear()}-W${Math.ceil(((now - yearStart) / 86400000 + yearStart.getDay() + 1) / 7)}`;
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const domain = getDomainName(location.hostname);
    
    let icon = null;
    
    // Only attempt to fetch the icon if it hasn't been fetched in this session or if it's time for a refresh
    if (!iconFetched || intervalCounter % iconFetchInterval === 0) {
        console.log(`[content.js] Attempting to fetch favicon for domain: ${domain}`);
        try {
            const faviconUrl = getFaviconUrl();
            const response = await fetch(faviconUrl);
            if (response.ok) {
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();
                icon = Array.from(new Uint8Array(arrayBuffer));
                iconFetched = true;
                console.log(`[content.js] Successfully fetched favicon for ${domain}.`);
            } else {
                console.warn(`[content.js] Could not fetch favicon for ${domain}: HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.warn(`[content.js] Failed to fetch favicon for ${domain}:`, error);
        }
    }

    // Send a single, comprehensive message to the background script
    browser.runtime
        .sendMessage({
            action: "updateDomainTimeWithIcon",
            domain,
            date,
            week,
            month,
            seconds: 1, // Always send 1 second per interval
            icon, // Can be null if fetching failed or not time to fetch
        })
        .then(() => {
            console.log(`[content.js] Sent 'updateDomainTimeWithIcon' message for ${domain}.`);
        })
        .catch((error) => {
            console.error(`[content.js] Error sending message to background script:`, error);
        });

    // Also send a general time update (this is for total time, independent of domain)
    browser.runtime
        .sendMessage({
            action: "updateTime",
            date,
            week,
            month,
            seconds: 1,
        })
        .then(() => {
            console.log(`[content.js] Sent 'updateTime' message.`);
        })
        .catch((error) => {
            console.error(`[content.js] Error sending 'updateTime' message:`, error);
        });

    intervalCounter++;

}, updateInterval);