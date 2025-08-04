import { useEffect, useState } from "react";
import FlipCard from "../components/FlipCard";

function formatTimeParts(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return {
    hours: hrs.toString().padStart(2, "0"),
    minutes: mins.toString().padStart(2, "0"),
  };
}

export default function StatsPage() {
  const [todaySeconds, setTodaySeconds] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    const fetchTime = async () => {
      // Get the entire timeData object
      const data = await browser.runtime.sendMessage({ action: "getTime" });
      
      // Access the correct nested property for today's time
      // The new structure is timeData.daily[today]
      setTodaySeconds(data.daily[today] || 0);
    };

    fetchTime();
    const interval = setInterval(fetchTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const { hours, minutes } = formatTimeParts(todaySeconds);

  return (
    <div className="text-center mt-4">
      <h2 className="text-lg font-bold mb-4">Total Time Spent Today</h2>
      <div className="flex justify-center gap-4">
        <FlipCard value={hours} />
        <FlipCard value={minutes} />
      </div>
      <p className="mt-2 text-sm">Hours : Minutes</p>
    </div>
  );
}