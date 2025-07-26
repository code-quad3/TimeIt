let currentDay = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
let lastTime = Date.now();

// Checks every 15s (or any interval)
setInterval(() => {
  const now = Date.now();
  const newDay = new Date().toISOString().split("T")[0];

  // Auto-reset tracking if day has changed
  if (newDay !== currentDay) {
    currentDay = newDay;
    lastTime = now;
  }

  const elapsed = Math.floor((now - lastTime) / 1000);
  lastTime = now;

  const data = JSON.parse(localStorage.getItem("timeSpent") || "{}");
  data[currentDay] = (data[currentDay] || 0) + elapsed;
  localStorage.setItem("timeSpent", JSON.stringify(data));
}, 15000);
