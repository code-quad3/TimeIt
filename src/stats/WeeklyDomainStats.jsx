import { useEffect, useState } from "react";
import ProfileCard from "../components/Card";
import { formatTime, getTotalTimeForPeriod } from './utils/formatTime'; 
import {getSimplifiedDomainName} from './utils/getSimplifiedDomainName.js'
export function WeeklyDomainStats() {
  const [domainStats, setDomainStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        setIsLoading(true);
        const allDomains = await browser.runtime.sendMessage({ action: "getDomainTime" });
        
        const weeklyData = allDomains
          .map(domain => ({
            name: getSimplifiedDomainName(domain.domain),
            time: getTotalTimeForPeriod(domain.daily, 7),
            // The fix: We now store the full domain so we can use it to fetch the favicon.
            fullDomain: domain.domain
          }))
          .filter(domain => domain.time > 0);

        const faviconPromises = weeklyData.map(async (domain) => {
          // The fix: We now use the fullDomain to request the favicon from the background script.
          const faviconData = await browser.runtime.sendMessage({ action: "getFavicon", domain: domain.fullDomain });
          return {
            ...domain,
            img: faviconData ? `data:image/png;base64,${faviconData}` : 'https://placehold.co/16x16/cccccc/000000?text=?',
          };
        });
        const weeklyStatsWithIcons = await Promise.all(faviconPromises);

        const sortedStats = weeklyStatsWithIcons.sort((a, b) => b.time - a.time);
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
    return <div className="text-gray-400 text-center">Loading weekly statistics...</div>;
  }

  if (domainStats.length === 0) {
    return <p className="text-gray-500 text-center">No usage data for this week.</p>;
  }

  return (
<>
   <h2 className="text-2xl font-bold text-left text-gray-700 mb-6 mt-6 ml-2.5">Weekly Domain Usage</h2>
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