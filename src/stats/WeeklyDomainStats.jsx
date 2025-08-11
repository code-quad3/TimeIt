import { useEffect, useState, useContext } from "react";
import ProfileCard from "../components/Card";
import { formatTime, getTotalTimeForPeriod } from "./utils/formatTime";
import { ThemeContext } from "../context/ThemeContext";

export function WeeklyDomainStats() {
  const [domainStats, setDomainStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        setIsLoading(true);
        const allDomains = await browser.runtime.sendMessage({
          action: "getDomainTime",
        });

        const weeklyData = allDomains
          .map((domain) => ({
            name: domain.domain,
            time: getTotalTimeForPeriod(domain.daily, 7),
            fullDomain: domain.domain,
          }))
          .filter((domain) => domain.time > 0);

        const faviconPromises = weeklyData.map(async (domain) => {
          const faviconData = await browser.runtime.sendMessage({
            action: "getFavicon",
            domain: domain.fullDomain,
          });
          return {
            ...domain,
            img: faviconData
              ? `data:image/png;base64,${faviconData}`
              : "https://placehold.co/16x16/cccccc/000000?text=?",
          };
        });

        const weeklyStatsWithIcons = await Promise.all(faviconPromises);
        const sortedStats = weeklyStatsWithIcons.sort(
          (a, b) => b.time - a.time
        );

        setDomainStats(sortedStats);
      } catch (e) {
        console.error("Failed to fetch weekly domain stats:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklyData();
  }, []);

  if (isLoading) {
    return (
      <div
        className={`text-center ${
          darkMode ? "text-gray-300" : "text-gray-600"
        }`}
      >
        Loading weekly statistics...
      </div>
    );
  }

  if (domainStats.length === 0) {
    return (
      <p
        className={`text-center ${
          darkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        No usage data for this week.
      </p>
    );
  }

  return (
    <div className={darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}>
      <h2
        className={`text-2xl font-bold text-left mb-6 mt-6 ml-2.5 ${
          darkMode ? "text-gray-200" : "text-gray-700"
        }`}
      >
        Weekly Domain Usage
      </h2>
      <div className="flex flex-wrap justify-start gap-4 overflow-y-auto max-h-96 mb-20">
        {domainStats.map((stat, index) => (
          <ProfileCard
            key={index}
            img={stat.img}
            name={stat.name}
            time={formatTime(stat.time)}
          />
        ))}
      </div>
    </div>
  );
}
