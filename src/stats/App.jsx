import { useRef, useState, useContext } from "react";
import { WeekStat } from "./WeekStat";
import { MonthStat } from "./MonthStat";
import { DailyDomainStats } from "./DailyDomainStats";
import { WeeklyDomainStats } from "./WeeklyDomainStats";
import { MonthlyDomainStats } from "./MonthlyDomainStats";
import { ThemeProvider, ThemeContext } from "../context/ThemeContext";

function AppContent() {
  const [activeTab, setActiveTab] = useState("daily");
  const tabsRef = useRef(null);
  const { darkMode } = useContext(ThemeContext);

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
   <div
  className={`p-6 rounded-md min-h-screen transition-colors duration-300 ${
    darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
  }`}
>
  {/* Weekly and Monthly Graphs */}
  <div
    className={`flex justify-between gap-4 mb-8 p-4 rounded-md ${
      darkMode ? "bg-gray-800" : "bg-gray-100"
    }`}
  >
    <div className="w-1/2">
      <WeekStat />
    </div>
    <div className="w-1/2">
      <MonthStat />
    </div>
  </div>

  {/* Tab Navigation */}
  <div ref={tabsRef}>
    <div
      className={`flex gap-4 mb-4 border-b ${
        darkMode ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-white"
      } rounded-md`}
    >
      {["daily", "weekly", "monthly"].map((tab) => (
        <button
          type="button"
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={`py-2 px-4 border-b-2 transition-all duration-200 rounded-t-md ${
            activeTab === tab
              ? darkMode
                ? "border-blue-400 text-blue-400 font-semibold"
                : "border-blue-500 text-blue-500 font-semibold"
              : darkMode
              ? "border-transparent text-gray-400 hover:text-blue-400"
              : "border-transparent text-gray-600 hover:text-blue-600"
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  </div>

  {/* Tab Content */}
  <div
    className={`mb-8 min-h-[400px] p-4 rounded-md ${
      darkMode ? "bg-gray-800" : "bg-white"
    } shadow`}
  >
    {renderActiveTab()}
  </div>
</div>

  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
