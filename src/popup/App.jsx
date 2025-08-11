import "./App.css";
import {
  ChartColumnDecreasing,
  Ban,
  CirclePause,
  Moon,
  Settings,
  LockOpen,
  RotateCcw,
  CirclePlay,
  CircleStop,
} from "lucide-react";
import StatsPage from "./Time";
import { useContext, useState, useRef, useEffect } from "react";
import { ThemeContext, ThemeProvider } from "../context/ThemeContext";

function AppContent() {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const browserAPI = window.browser || window.chrome;

  const toggleTimer = () => {
    setIsTimerVisible(!isTimerVisible);
  };
  
  const openStatsTab = () => {
    browserAPI.tabs.create({ url: "stats.html" });
  };

  const openBlockedTab = () => {
    browserAPI.tabs.create({ url: "blocked.html" });
  };

  const ondarkMode = () => {
    toggleTheme(!darkMode);
  };

  const blockCurrentDomain = async () => {
    try {
      const [tab] = await browserAPI.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab || !tab.url) return;

      const url = new URL(tab.url);
      const domain = url.hostname;

      const response = await browserAPI.runtime.sendMessage({
        action: "blockDomain",
        domain,
      });

      if (response?.success) {
        console.log(`Blocked domain: ${domain}`);
        window.close();
      }
    } catch (err) {
      console.error("Error blocking domain:", err);
    }
  };

  const resetData = async () => {
    try {
      
      const response = await browserAPI.runtime.sendMessage({
        action: "resetData"
      });

      if (response?.success) {
        console.log(response?.message);
        window.close();
      }
    } catch (err) {
      console.error("Error while reseting Data", err);
    }
  };

  return (
    <div
      className={`p-2 min-h-screen duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      {isTimerVisible ? (
        <PomodoroTimer />
      ) : (
        <>
          {/* Top bar */}
          <div className="flex flex-row gap-2">
            {/* Dark mode button */}
            <button
              className={`p-5 rounded-md hover:ring-2 hover:opacity-80 ${
                darkMode
                  ? "bg-white hover:ring-black"
                  : "bg-emerald-950 hover:ring-black"
              }`}
              onClick={ondarkMode}
            >
              <Moon
                className={`${darkMode ? "text-black" : "text-amber-50"} w-6 h-6`}
              />
            </button>

            {/* Settings button */}
            <button
              className={`p-5 rounded-md hover:ring-2 hover:opacity-80 ${
                darkMode
                  ? "bg-white hover:ring-black"
                  : "bg-emerald-950 hover:ring-black"
              }`}
              onClick={() => setSidebarOpen(true)}
            >
              <Settings
                className={`${darkMode ? "text-black" : "text-amber-50"} w-6 h-6`}
              />
            </button>
          </div>

          {/* Main content */}
          <StatsPage />
          <div className="flex justify-between mt-4 gap-2">
            <button
              className={`p-5 rounded-md hover:ring-2 hover:opacity-80 ${
                darkMode
                  ? "bg-white hover:ring-black"
                  : "bg-emerald-950 hover:ring-black"
              }`}
              onClick={openStatsTab}
            >
              <ChartColumnDecreasing
                className={`${darkMode ? "text-black" : "text-amber-50"} w-6 h-6`}
              />
            </button>

            <button
              className={`p-4 rounded-md hover:ring-2 hover:opacity-80 ${
                darkMode
                  ? "bg-white hover:ring-black"
                  : "bg-emerald-950 hover:ring-white"
              }`}
              onClick={blockCurrentDomain}
            >
              <Ban
                className={`${darkMode ? "text-black" : "text-amber-50"} w-6 h-6`}
              />
            </button>

            <button
              onClick={toggleTimer}
              className={`p-5 rounded-md hover:ring-2 hover:opacity-80 ${
                darkMode
                  ? "bg-white hover:ring-black"
                  : "bg-emerald-950 hover:ring-white"
              }`}
            >
              <CirclePause
                className={`${darkMode ? "text-black" : "text-amber-50"} w-6 h-6`}
              />
            </button>
          </div>

          {/* Sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div
            className={`fixed top-0 right-0 h-full w-64 ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            } shadow-lg z-50 transform transition-transform duration-300 ${
              sidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300 dark:border-gray-700">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-xl font-bold hover:opacity-70"
              >
                ✕
              </button>
            </div>

            {/* Sidebar buttons */}
            <div className="flex flex-col gap-3 p-4">
              {/* Unlock Domain */}
              <button
                onClick={openBlockedTab}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <LockOpen className="h-6 w-6" />
                <span>Unlock Domain</span>
              </button>

              {/* Reset Data */}
              <button
                onClick={resetData}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                <RotateCcw className="h-6 w-6" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>
        </>
      ) }
    </div>
  );
}

function PomodoroTimer() {
  const { darkMode } = useContext(ThemeContext);
  const [sessionMinutes, setSessionMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timerMessage, setTimerMessage] = useState("");
  const timerRef = useRef(null);

  const browserAPI = window.browser || window.chrome;

  // Function to save state to local storage
  const saveState = async (state) => {
    try {
      await browserAPI.storage.local.set({ pomodoroState: JSON.stringify(state) });
    } catch (err) {
      console.error("Error saving state:", err);
    }
  };

  // Function to load state from local storage
  const loadState = async () => {
    try {
      const result = await browserAPI.storage.local.get("pomodoroState");
      if (result.pomodoroState) {
        const storedState = JSON.parse(result.pomodoroState);
        setSessionMinutes(storedState.sessionMinutes);
        setBreakMinutes(storedState.breakMinutes);
        setTimeLeft(storedState.timeLeft);
        setIsRunning(storedState.isRunning);
        setIsBreak(storedState.isBreak);
        setTimerMessage(storedState.timerMessage);
      }
    } catch (err) {
      console.error("Error loading state:", err);
    }
  };

  // Effect to load state on component mount
  useEffect(() => {
    loadState();
  }, []);

  // Main timer logic using useEffect and setTimeout for a more reliable countdown.
  useEffect(() => {
    if (!isRunning) {
      // Clear the timer if it's not running
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }

    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else {
      // Timer finished, toggle between session and break
      if (isBreak) {
        setTimerMessage("✅ Break is over! Back to work.");
        // Stop the timer and reset
        stopTimer();
      } else {
        setTimerMessage("⏳ Session ended! Time for your break.");
        // Start the break timer
        setIsBreak(true);
        setTimeLeft(breakMinutes * 60);
      }
    }

    // Cleanup function to clear the timeout
    return () => clearTimeout(timerRef.current);
  }, [isRunning, timeLeft, isBreak, breakMinutes]);

  // Effect to save state whenever it changes
  useEffect(() => {
    const state = {
      sessionMinutes,
      breakMinutes,
      timeLeft,
      isRunning,
      isBreak,
      timerMessage,
    };
    saveState(state);
  }, [sessionMinutes, breakMinutes, timeLeft, isRunning, isBreak, timerMessage]);

  const startSessionTimer = () => {
    setTimerMessage("");
    setIsRunning(true);
    setIsBreak(false);
    setTimeLeft(sessionMinutes * 60);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(sessionMinutes * 60);
    setTimerMessage("");
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleStart = () => {
    if (isRunning) return;
    startSessionTimer();
  };

  const handleStop = () => {
    stopTimer();
  };

  return (
    <div
      className={`p-6  rounded-xl shadow-lg max-w-sm mx-auto ${
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <h2 className="text-xl font-bold mb-4 text-center">
        {isBreak ? "Break Time" : "Pomodoro Timer"}
      </h2>
      
      {/* Timer message area */}
      {timerMessage && (
        <div className="mb-4 text-center text-green-500 font-semibold">
          {timerMessage}
        </div>
      )}

      {/* Timer settings inputs */}
      <div className="flex flex-col gap-4 mb-4">
        <label className="block font-medium">
          Session (minutes)
          <input
            type="number"
            min="1"
            max="60"
            value={sessionMinutes}
            onChange={(e) => setSessionMinutes(Number(e.target.value))}
            className={`w-full p-2 rounded border ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-gray-100 border-gray-300 text-gray-900"
            }`}
            disabled={isRunning}
          />
        </label>

        <label className="block font-medium">
          Break (minutes)
          <input
            type="number"
            min="1"
            max="60"
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(Number(e.target.value))}
            className={`w-full p-2 rounded border ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-gray-100 border-gray-300 text-gray-900"
            }`}
            disabled={isRunning}
          />
        </label>
      </div>

      <div className="text-6xl font-extrabold mb-4 text-center">
        {formatTime(timeLeft)}
      </div>

      {/* Timer control buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className={`p-4 rounded-full shadow-md transition-colors ${
            isRunning ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
          }`}
          aria-label="Start timer"
        >
          <CirclePlay className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={handleStop}
          disabled={!isRunning}
          className={`p-4 rounded-full shadow-md transition-colors ${
            !isRunning ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
          }`}
          aria-label="Stop timer"
        >
          <CircleStop className="w-6 h-6 text-white" />
        </button>
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
