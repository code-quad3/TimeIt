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

// This function formats the raw daily data for the last 30 days for the chart
const formatMonthlyData = (dailyTimeData) => {
  const chartData = [];
  const today = new Date();

  // Loop through the last 30 days (from today backwards)
  for (let i = 29; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const dateString = day.toISOString().split("T")[0];
    // For a 30-day chart, using a short date format is better than day names
    const shortDate = day.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

    // Get the time for this day, or default to 0 if no data exists
    const timeInSeconds = dailyTimeData[dateString] || 0;
    const timeInMinutes = secondsToMinutes(timeInSeconds);

    chartData.push({
      name: shortDate,
      // The `dataKey` in the chart component will map to this property
      monthly: timeInMinutes,
    });
  }

  return chartData;
};

// The MonthStat component contains all the UI and logic for the monthly chart
export function MonthStat() {
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
        Loading monthly statistics...
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
  const monthlyChartData = formatMonthlyData(timeData.daily);
  
  return (
    <div className="bg-gray-900 text-white min-h-screen p-8 font-sans">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">Monthly Usage Statistics</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-6 text-center text-amber-500">Daily Usage (Last 30 Days)</h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={monthlyChartData}
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
                dataKey="monthly" // The dataKey now corresponds to the monthly data
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