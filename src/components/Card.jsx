import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import React from "react";
const ProfileCard = ({ img, name, time }) => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div
      className={`p-6 rounded-2xl shadow-md text-center max-w-xs mx-auto font-sans flex flex-col items-center transition-colors duration-300
        ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white text-black"
        }`}
    >
      {/* Profile image */}
      <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
        <img
          src={img}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Name */}
      <div
        className={`text-xl font-semibold mb-2 ${
          darkMode ? "text-gray-100" : "text-gray-800"
        }`}
      >
        {name}
      </div>

      {/* Time */}
      <div
        className={`text-base font-bold ${
          darkMode ? "text-gray-300" : "text-gray-600"
        }`}
      >
        {time}
      </div>
    </div>
  );
};

export default ProfileCard;
