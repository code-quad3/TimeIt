import { useEffect, useState, useContext } from "react";
import FlipCard from "../components/FlipCard";
import { ThemeContext } from "../context/ThemeContext";

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
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    const fetchTime = async () => {
      const data = await browser.runtime.sendMessage({ action: "getTime" });
      setTodaySeconds(data.daily[today] || 0);
    };

    fetchTime();
    const interval = setInterval(fetchTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const { hours, minutes } = formatTimeParts(todaySeconds);

  return (
    <div
      className={`text-center mt-4 transition-colors duration-300 ${
        darkMode ? "text-white" : "text-black"
      }`}
    >
      <h2 className="text-lg font-bold mb-4">Total Time Spent Today</h2>
      <div className="flex justify-center gap-4">
        <FlipCard value={hours} />
        <FlipCard value={minutes} />
      </div>
      <p className="mt-2 text-sm">Hours : Minutes</p>
    </div>
  );
}
