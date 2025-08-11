import React, { useState, useContext, useEffect, useRef } from "react";
import { ThemeContext } from "../context/ThemeContext";

const BlockedList = ({ name, onUnblock }) => {
  const { darkMode } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleUnblock = () => {
    onUnblock();
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <li
      className={`flex justify-between items-center px-5 py-3 rounded-[30px] mb-4 shadow-sm hover:shadow-md transition-shadow relative ${
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Bigger font size for domain name */}
      <span className="text-lg font-medium">{name}</span>

      <div className="relative" ref={menuRef}>
        <span
          className="cursor-pointer text-2xl px-3 py-2 rounded-full select-none hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          ⋮
        </span>

        {isMenuOpen && (
          <div
            className={`absolute top-full right-0 mt-2 border rounded-lg shadow-lg z-10 min-w-[120px] ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
            }`}
          >
            <button
              className={`block w-full px-4 py-2 text-left text-sm hover:${
                darkMode ? "bg-gray-600" : "bg-gray-100"
              }`}
              onClick={handleUnblock}
            >
              Unblock
            </button>
          </div>
        )}
      </div>
    </li>
  );
};

export default BlockedList;
