import { useEffect, useState } from "react";
import ProfileCard from "../components/Card";
import { formatTime, getTotalTimeForPeriod } from './utils/formatTime'; 
import {getSimplifiedDomainName} from './utils/getSimplifiedDomainName.js'


export function MonthlyDomainStats() {
  const [domainStats, setDomainStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setIsLoading(true);
        const allDomains = await browser.runtime.sendMessage({ action: "getDomainTime" });
        
        const monthlyData = allDomains
          .map(domain => ({
            name: getSimplifiedDomainName(domain.domain),
            time: getTotalTimeForPeriod(domain.daily, 30),
            // We need to keep the full domain to fetch the favicon correctly.
            fullDomain: domain.domain
          }))
          .filter(domain => domain.time > 0);

        const faviconPromises = monthlyData.map(async (domain) => {
          // The fix: Use the fullDomain property to request the favicon.
          const faviconData = await browser.runtime.sendMessage({ action: "getFavicon", domain: domain.fullDomain });
          return {
            ...domain,
            img: faviconData ? `data:image/png;base64,${faviconData}` : 'https://placehold.co/16x16/cccccc/000000?text=?',
          };
        });
        const monthlyStatsWithIcons = await Promise.all(faviconPromises);

        const sortedStats = monthlyStatsWithIcons.sort((a, b) => b.time - a.time);
        setDomainStats(sortedStats);
      } catch (e) {
        console.error("Failed to fetch monthly domain stats:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthlyData();
  }, []);

  if (isLoading) {
    return <div className="text-gray-400 text-center">Loading monthly statistics...</div>;
  }

  if (domainStats.length === 0) {
    return <p className="text-gray-500 text-center">No usage data for this month.</p>;
  }

  return (
    <>
    <h2 className="text-2xl font-bold text-left text-gray-700 mb-6 mt-6 ml-2.5">Monthly Domain Usage</h2>
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