// content.js

console.log("Content script loaded on:", window.location.href);

/**
 * Sends the simplified domain name to the background script every second.
 * Background script handles time tracking, data storage, and favicon fetching.
 */
setInterval(() => {
  // Extract and simplify the domain
  const domain = location.hostname;

  browser.runtime
    .sendMessage({
      action: "updateActiveTab",
      domain: domain,
    })
    .catch((error) => {
      console.error(
        `[content.js] Error sending message to background script:`,
        error
      );
    });
}, 1000);
