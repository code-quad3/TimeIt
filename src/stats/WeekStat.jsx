import { useEffect, useState, useContext } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ThemeContext } from "../context/ThemeContext";

// Helper: seconds → minutes
const secondsToMinutes = (seconds) => Math.floor(seconds / 60);

// Format daily data for last 7 days
const formatWeeklyData = (dailyTimeData) => {
  const chartData = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const dateString = day.toISOString().split("T")[0];
    const dayName = day.toLocaleDateString("en-US", { weekday: "short" });

    const timeInSeconds = dailyTimeData[dateString] || 0;
    const timeInMinutes = secondsToMinutes(timeInSeconds);

    chartData.push({
      name: dayName,
      weekly: timeInMinutes,
    });
  }

  return chartData;
};

export function WeekStat() {
  const { darkMode } = useContext(ThemeContext); // Get theme
  const [timeData, setTimeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimeData = async () => {
      try {
        setIsLoading(true);
        const data = await browser.runtime.sendMessage({ action: "getTime" });
        setTimeData(data);
      } catch (e) {
        console.error("Failed to fetch time data:", e);
        setError("Could not fetch data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeData();
  }, []);

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center h-screen ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Loading weekly statistics...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center h-screen ${
          darkMode ? "text-red-400" : "text-red-600"
        }`}
      >
        Error: {error}
      </div>
    );
  }

  const weeklyChartData = formatWeeklyData(timeData.rollingDaily);

  return (
    <div
      className={`min-h-screen p-8 font-sans ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">
          Weekly Usage Statistics
        </h1>

        <div
          className={`p-6 rounded-lg shadow-xl ${
            darkMode ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-6 text-center ${
              darkMode ? "text-amber-500" : "text-amber-600"
            }`}
          >
            Daily Usage (Last 7 Days)
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={weeklyChartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={darkMode ? "#4a5568" : "#d1d5db"}
              />
              <XAxis dataKey="name" stroke={darkMode ? "#cbd5e0" : "#374151"} />
              <YAxis
                label={{
                  value: "Minutes",
                  angle: -90,
                  position: "insideLeft",
                  fill: darkMode ? "#cbd5e0" : "#374151",
                }}
                stroke={darkMode ? "#cbd5e0" : "#374151"}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? "#2d3748" : "#f9fafb",
                  border: `1px solid ${darkMode ? "#4a5568" : "#d1d5db"}`,
                }}
                itemStyle={{
                  color: darkMode ? "#cbd5e0" : "#111827",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Line
                type="monotone"
                dataKey="weekly"
                stroke="#82ca9d"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
