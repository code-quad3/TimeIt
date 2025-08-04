import React, { useEffect, useState } from 'react';
import './LoadingBar.css';

const LoadingBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="wrapper">
      <div className="loading-container">
        <div className="loading-bar" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="percent-text">
        {progress < 100 ? `${progress}%` : 'Complete ✔️'}
      </div>
    </div>
  );
};

export default LoadingBar;
