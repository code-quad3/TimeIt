import "./App.css";
import { ChartColumnDecreasing } from "lucide-react";
import { Ban } from "lucide-react";
import { CirclePause } from "lucide-react";
import StatsPage from "./Time";

function App() {
  // This function will be called when the button is clicked
  const openStatsTab = () => {
    // The `browser` API is used to interact with the browser's tabs.
    // We create a new tab and specify the URL to open.
    // You would replace 'stats.html' with the actual path to your full-page stats UI.
    browser.tabs.create({ url: "stats.html" });
  };

  return (
    <>
      <StatsPage />
      <div className="flex justify-between mt-4 gap-2">
        <button
          className="bg-emerald-950 p-2 rounded-md hover:ring hover:ring-white hover:opacity-80"
          onClick={openStatsTab} // Attach the onClick handler here
        >
          <ChartColumnDecreasing className="text-amber-50 w-5 h-5" />
        </button>
        <button className="bg-gray-700 p-2 rounded-md hover:ring hover:ring-white hover:opacity-80">
          <Ban className="text-white w-5 h-5" />
        </button>
        <button className="bg-blue-700 p-2 rounded-md hover:ring hover:ring-white hover:opacity-80">
          <CirclePause className="text-white w-5 h-5" />
        </button>
      </div>
    </>
  );
}

export default App;