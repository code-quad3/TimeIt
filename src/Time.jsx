import { useEffect, useState } from "react";

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hrs.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m`;
}

export default function StatsPage() {
  const [todaySeconds, setTodaySeconds] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    const fetchTime = async () => {
      const data = await browser.runtime.sendMessage({ action: "getTime" });
      setTodaySeconds(data[today] || 0);
    };

    fetchTime();
    const interval = setInterval(fetchTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center mt-4">
      <h2 className="text-lg font-bold">Total Time Spent Today</h2>
      <p className="text-3xl">{formatTime(todaySeconds)}</p>
    </div>
  );
}
