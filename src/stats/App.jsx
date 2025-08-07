import { useRef, useState } from "react";
import { WeekStat } from "./WeekStat";
import { MonthStat } from "./MonthStat";
import { DailyDomainStats } from "./DailyDomainStats";
import { WeeklyDomainStats } from "./WeeklyDomainStats";
import { MonthlyDomainStats } from "./MonthlyDomainStats";

function App() {
  const [activeTab, setActiveTab] = useState("daily");
  const tabsRef = useRef(null);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "daily":
        return <DailyDomainStats />;
      case "weekly":
        return <WeeklyDomainStats />;
      case "monthly":
        return <MonthlyDomainStats />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Weekly and Monthly Graphs */}
      <div className="flex justify-between gap-4 mb-8">
        <div className="w-1/2">
          <WeekStat />
        </div>
        <div className="w-1/2">
          <MonthStat />
        </div>
      </div>

      {/* Tab Navigation */}
      <div ref={tabsRef}>
        <div className="flex gap-4 mb-4 border-b">
          {["daily", "weekly", "monthly"].map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`py-2 px-4 border-b-2 transition-all duration-200 ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600 font-semibold"
                  : "border-transparent text-gray-500 hover:text-blue-500"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-8 min-h-[400px]">
        {renderActiveTab()}
      </div>
    </>
  );
}

export default App;
