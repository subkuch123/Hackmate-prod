import React, { useEffect, useState } from "react";
import "./loader.css";
import useIsMobile from "@/hooks/isMobile";

interface LoaderProps {
  duration?: number; // milliseconds
}

const Loader: React.FC<LoaderProps> = ({ duration = 5000 }) => {
  const [zoomOut, setZoomOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setZoomOut(true);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const isMobile = useIsMobile();

  return isMobile ? (
    <>
      <div className="ai-matrix-loader">
        <div className="digit">0</div>
        <div className="digit">1</div>
        <div className="digit">0</div>
        <div className="digit">1</div>
        <div className="digit">1</div>
        <div className="digit">0</div>
        <div className="digit">0</div>
        <div className="digit">1</div>
        <div className="glow"></div>
      </div>
    </>
  ) : (
    <div className={`loader-container ${zoomOut ? "zoom-out" : ""}`}>
      <h1 className="loader">HackMate 2k25</h1>
    </div>
  );
};

export default Loader;
