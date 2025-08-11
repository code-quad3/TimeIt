import React, { useState, useContext, useEffect } from "react";
import { ThemeContext, ThemeProvider } from "../context/ThemeContext";
import { Search } from "lucide-react";
import BlockedList from "../components/BlockedList";

function AppContent() {
  const { darkMode } = useContext(ThemeContext);
  const [blockedDomains, setBlockedDomains] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const getBlockedList = () => {
    return new Promise((resolve) => {
      browser.runtime.sendMessage({ action: "getBlockedList" }, (response) => {
        if (Array.isArray(response) && response.length > 0) {
          console.log(response[0].domain); // safe access
          console.log(response[0].time); // safe access
          resolve(response);
        } else {
          // fallback data
          resolve([
         
          ]);
        }
      });
    });
  };

  const handleUnblock = async (domainName) => {
    const response = await browser.runtime.sendMessage({
      action: "unblockDomain",
      domain: domainName,
    });

    if (response && response.success) {
      setBlockedDomains((prev) =>
        prev.filter((item) => item.name !== domainName)
      );
    }
  };

  useEffect(() => {
    (async () => {
      const list = await getBlockedList();

      setBlockedDomains(
        list.map((item) => ({
          id: item.time || Date.now(), // use time if available, else fallback
          name: item.domain, // from response[i].domain
          blockedAt: item.time || null, // store raw time if needed
        }))
      );
    })();
  }, []);

  const filteredDomains = blockedDomains.filter((domain) =>
    (domain.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`w-screen h-screen p-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        />
        <input
          type="search"
          placeholder="Search blocked domains..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full py-2 pl-10 pr-4 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 
            ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
            }`}
        />
      </div>

      {/* Blocked Domains List */}
      <ul className="list-none p-0">
        {filteredDomains.length > 0 ? (
          filteredDomains.map((domain) => (
            <BlockedList
              key={domain.id}
              name={domain.name}
              onUnblock={() => handleUnblock(domain.name)}
            />
          ))
        ) : (
          <p
            className={`text-center ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No blocked domains found.
          </p>
        )}
      </ul>
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
