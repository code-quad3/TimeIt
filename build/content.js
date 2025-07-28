// Every second, send the updated time
let seconds = 0;

setInterval(() => {
  seconds++;
  const today = new Date().toISOString().split("T")[0];
  browser.runtime.sendMessage({
    action: "updateTime",
    date: today,
    seconds: 1,
  });
}, 1000);