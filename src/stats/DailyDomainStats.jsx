import { useEffect, useState } from "react";
import ProfileCard from "../components/Card";
import { formatTime } from "./utils/formatTime";

/**
 * A helper function to simplify the domain name.
 * e.g., 'google.com' becomes 'google'
 * e.g., 'bbc.gov.in' becomes 'bbc'
 * @param {string} domain - The full domain name.
 * @returns {string} The simplified domain name.
 */

export function DailyDomainStats() {
  const [domainStats, setDomainStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        setIsLoading(true);
        // Get all domain time entries from the background script.
        const allDomains = await browser.runtime.sendMessage({
          action: "getDomainTime",
        });

        const today = new Date().toISOString().split("T")[0];

        const dailyData = allDomains
          .map((domain) => ({
            // Simplify the domain name here before passing it to the ProfileCard.
            name: domain.domain,
            time: domain.daily[today] || 0,
            fullDomain: domain.domain, // Keep the full domain for the favicon lookup.
          }))
          .filter((domain) => domain.time > 0);

        const faviconPromises = dailyData.map(async (domain) => {
          // Use the original full domain to get the favicon.
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
        const dailyStatsWithIcons = await Promise.all(faviconPromises);

        const sortedStats = dailyStatsWithIcons.sort((a, b) => b.time - a.time);

        setDomainStats(sortedStats);
      } catch (e) {
        console.error("Failed to fetch daily domain stats:", e);
        setError("Could not fetch domain statistics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyData();
  }, []);

  if (isLoading) {
    return (
      <div className="text-gray-400 text-center">
        Loading daily statistics...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 text-center">Error: {error}</div>;
  }

  if (domainStats.length === 0) {
    return (
      <p className="text-gray-500 text-center">No usage data for today.</p>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-left text-gray-700 mb-6 mt-6 ml-2.5">
        Daily Domain Usage
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
    </>
  );
}
