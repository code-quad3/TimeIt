// content.js

console.log("Content script loaded on:", window.location.href);

/**
 * This interval sends a single, concise message to the background script every second.
 * The background script is responsible for all time tracking and data management,
 * including fetching the favicon with the correct hostname.
 */
setInterval(() => {
    // We send the hostname with just the 'www.' prefix removed.
    // This provides a valid domain name for the favicon API without
    // losing important information like ".com" or ".org".
    const domain = location.hostname.replace(/^www\./, "");
    
    browser.runtime
        .sendMessage({
            action: "updateActiveTab",
            domain: domain,
        })
        .catch((error) => {
            console.error(`[content.js] Error sending message to background script:`, error);
        });
}, 1000);