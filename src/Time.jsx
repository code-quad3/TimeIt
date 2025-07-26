import { useEffect, useState } from "react";

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hrs}h ${mins}m`;
}

export default function StatsPage() {
  const [todaySeconds, setTodaySeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toISOString().split("T")[0];
      const data = JSON.parse(localStorage.getItem("timeSpent") || "{}");
      setTodaySeconds(data[today] || 0);
    }, 1000); // Updates every second for live stats

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center mt-4">
      <h2 className="text-lg font-bold">Time Spent Today</h2>
      <p className="text-3xl">{formatTime(todaySeconds)}</p>
    </div>
  );
}
