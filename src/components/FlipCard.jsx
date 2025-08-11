import { useEffect, useState, useContext } from "react";
import "./FlipCard.css";
import { ThemeContext } from "../context/ThemeContext";
import React from "react";
export default function FlipCard({ value }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    if (value !== displayValue) {
      setFlipping(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setFlipping(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  return (
    <div className="perspective w-26 h-30 custom-font">
      <div className={`flip-card ${flipping ? "animate-flip" : ""}`}>
        <div
          className={`flip-front ${
            darkMode ? "flip-dark" : "flip-light"
          }`}
        >
          {flipping ? displayValue : value}
        </div>
        <div
          className={`flip-back ${
            darkMode ? "flip-dark" : "flip-light"
          }`}
        >
          {flipping ? value : displayValue}
        </div>
      </div>
    </div>
  );
}
