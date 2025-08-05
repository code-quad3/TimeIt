import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Helper function to format seconds into minutes for better chart readability
const secondsToMinutes = (seconds) => Math.floor(seconds / 60);

// This function formats the raw daily data for the last 7 days for the chart
const formatWeeklyData = (dailyTimeData) => {
  const chartData = [];
  const today = new Date();

  // Loop through the last 7 days (from today backwards)
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const dateString = day.toISOString().split("T")[0];
    const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });

    // Get the time for this day, or default to 0 if no data exists
    const timeInSeconds = dailyTimeData[dateString] || 0;
    const timeInMinutes = secondsToMinutes(timeInSeconds);

    chartData.push({
      name: dayName,
      // The `dataKey` in the chart component will map to this property
      weekly: timeInMinutes,
    });
  }

  return chartData;
};

// The WeekStat component contains all the UI and logic for the weekly chart
export function WeekStat() {
  const [timeData, setTimeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimeData = async () => {
      try {
        setIsLoading(true);
        // Fetch all the time data from the background script
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
      <div className="flex items-center justify-center h-screen text-white">
        Loading weekly statistics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-400">
        Error: {error}
      </div>
    );
  }

  // Prepare the chart data
  const weeklyChartData = formatWeeklyData(timeData.daily);
  
  return (
    <div className="bg-gray-900 text-white min-h-screen p-8 font-sans">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">Weekly Usage Statistics</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-6 text-center text-amber-500">Daily Usage (Last 7 Days)</h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={weeklyChartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
              <XAxis dataKey="name" stroke="#cbd5e0" />
              <YAxis 
                label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#cbd5e0' }} 
                stroke="#cbd5e0" 
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }}
                itemStyle={{ color: '#cbd5e0' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
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