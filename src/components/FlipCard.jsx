import { useEffect, useState } from "react";
import "./FlipCard.css";

export default function FlipCard({ value }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setFlipping(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setFlipping(false);
      }, 600); // Must match animation time

      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  return (
    <div className="perspective w-26 h-30 custom-font">
      <div className={`flip-card ${flipping ? "animate-flip" : ""}`}>
        <div className="flip-front">
          {flipping ? displayValue : value}
        </div>
        <div className="flip-back">
          {flipping ? value : displayValue}
        </div>
      </div>
    </div>
  );
}
