let seconds = 0;

function getDomainName(hostname) {
  // Reverted to more robust domain name extraction
  const parts = hostname.replace(/^www\./, "").split(".");
  if (
    parts.length > 2 &&
    ["com", "org", "net", "gov", "edu", "co"].includes(parts[parts.length - 2])
  ) {
    return parts[parts.length - 3];
  }
  return parts[0];
}

function getFaviconUrl() {
  const links = document.querySelectorAll('link[rel~="icon"]');
  if (links.length > 0) return links[0].href;
  return `${location.origin}/favicon.ico`; // fallback
}

// Keep the interval at 1 second for time tracking, but fetch icon less frequently
const timeUpdateInterval = 1000; // Update time every 1 second
const iconFetchInterval = 10000; // Fetch icon every 10 seconds

// --- DEBUG: Confirm content script is loaded and running ---
console.log("Content script loaded on:", window.location.href);

setInterval(() => {
  seconds++; // This 'seconds' variable isn't used for cumulative time in the message, just as a local counter.
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const week = `${now.getFullYear()}-W${Math.ceil(
    ((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + now.getDay() + 1) /
      7
  )}`;
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;

  const domain = getDomainName(location.hostname);

  // Send regular time update (every 1 second)
  browser.runtime
    .sendMessage({
      action: "updateTime",
      date,
      seconds: 1, // Sending 1 second for each interval
    })
    .then(() => {
      // --- DEBUG: Confirm message sent successfully ---
      console.log(`[content.js] Sent 'updateTime': date=${date}, seconds=1`);
    })
    .catch((error) => {
      // --- DEBUG: Log errors if message fails to send ---
      console.error(`[content.js] Error sending 'updateTime' message:`, error);
    });
}, timeUpdateInterval);

// Separate interval for fetching and sending favicon (less frequent)
setInterval(async () => {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const week = `${now.getFullYear()}-W${Math.ceil(
    ((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + now.getDay() + 1) /
      7
  )}`;
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;

  const domain = getDomainName(location.hostname);
  const faviconUrl = getFaviconUrl();

  // --- DEBUG: Log favicon fetch attempt ---
  console.log(
    `[content.js] Attempting to fetch favicon for domain: ${domain} from URL: ${faviconUrl}`
  );

  try {
    const response = await fetch(faviconUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    browser.runtime
      .sendMessage({
        action: "updateDomainTimeWithIcon", // Action for icons
        domain,
        date,
        week,
        month,
        seconds: 1, // Sending 1 second for each interval (can be adjusted)
        icon: Array.from(new Uint8Array(arrayBuffer)), // convert to transferable format
        updatedAt: Date.now(),
      })
      .then(() => {
        // --- DEBUG: Confirm message sent successfully ---
        console.log(
          `[content.js] Sent 'updateDomainTimeWithIcon' for domain: ${domain} (with icon)`
        );
      })
      .catch((error) => {
        console.error(
          `[content.js] Error sending 'updateDomainTimeWithIcon' message with icon:`,
          error
        );
      });
  } catch (error) {
    // --- DEBUG: Log favicon fetch failure ---
    console.warn(`[content.js] Could not fetch favicon for ${domain}:`, error);

    // Even if favicon fails, send a regular domain time update
    browser.runtime
      .sendMessage({
        action: "updateDomainTimeWithIcon", // Keep the same action for background script consistency
        domain,
        date,
        week,
        month,
        seconds: 1,
        updatedAt: Date.now(),
      })
      .then(() => {
        // --- DEBUG: Confirm message sent successfully (without icon) ---
        console.log(
          `[content.js] Sent 'updateDomainTimeWithIcon' for domain: ${domain} (without icon, due to fetch error)`
        );
      })
      .catch((error) => {
        console.error(
          `[content.js] Error sending 'updateDomainTimeWithIcon' message without icon:`,
          error
        );
      });
  }
}, iconFetchInterval);
