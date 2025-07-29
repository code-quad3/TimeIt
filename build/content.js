let seconds = 0;

function getDomainName(hostname) {
  // Remove www. and .com-like TLDs
  return hostname.replace(/^www\./, '').split('.')[0];
}

setInterval(() => {
  seconds++;
  const now = new Date();
  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const week = `${now.getFullYear()}-W${Math.ceil(((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + now.getDay() + 1) / 7)}`;
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM

  const domain = getDomainName(location.hostname);

  browser.runtime.sendMessage({
    action: "updateDomainTime",
    domain,
    date,
    week,
    month,
    seconds: 1,
  });

  // Retain your original logic
  browser.runtime.sendMessage({
    action: "updateTime",
    date,
    seconds: 1,
  });

}, 1000);
