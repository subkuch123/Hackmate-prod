import React, { useEffect, useState, useRef, useCallback } from "react";

const AnimationHelper = ({
  isVisible,
  setIsVisible,
  animationDuration = 5000,
  component,
  videoSrc,
  enableVideo = false,
  animationType = "fade",
  showProgress = true,
  onAnimationEnd = () => {},
}) => {
  const [remainingTime, setRemainingTime] = useState(animationDuration);
  const [animationState, setAnimationState] = useState("entering");
  const [videoState, setVideoState] = useState({
    isLoaded: false,
    isPlaying: false,
    hasError: false,
  });

  const timerRef = useRef(null);
  const animationStartTime = useRef(null);
  const contentRef = useRef(null);
  const videoRef = useRef(null);
  const animationFrameRef = useRef(null);
  const videoPreloadRef = useRef(null);

  // Preload video when component mounts or videoSrc changes
  useEffect(() => {
    if (enableVideo && videoSrc) {
      // Preload video in background
      videoPreloadRef.current = document.createElement("video");
      videoPreloadRef.current.src = videoSrc;
      videoPreloadRef.current.preload = "auto";
      videoPreloadRef.current.load();

      videoPreloadRef.current.oncanplaythrough = () => {
        setVideoState((prev) => ({ ...prev, isLoaded: true }));
      };

      videoPreloadRef.current.onerror = () => {
        setVideoState((prev) => ({ ...prev, hasError: true }));
      };
    }

    return () => {
      if (videoPreloadRef.current) {
        videoPreloadRef.current.src = "";
        videoPreloadRef.current = null;
      }
    };
  }, [enableVideo, videoSrc]);

  // Calculate animation styles based on type
  const getAnimationStyles = () => {
    switch (animationType) {
      case "slide-up":
        return {
          entering: {
            transform: "translateY(100vh)",
            animation: "slideUpIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          },
          exiting: {
            animation:
              "slideDownOut 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          },
        };
      case "zoom":
        return {
          entering: {
            transform: "scale(0.8)",
            opacity: 0,
            animation: "zoomIn 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          },
          exiting: {
            animation: "zoomOut 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          },
        };
      case "slide-left":
        return {
          entering: {
            transform: "translateX(100vw)",
            animation: "slideLeftIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          },
          exiting: {
            animation:
              "slideRightOut 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          },
        };
      case "blur":
        return {
          entering: {
            filter: "blur(20px)",
            opacity: 0,
            animation: "blurIn 0.9s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          },
          exiting: {
            animation: "blurOut 0.9s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          },
        };
      default: // fade
        return {
          entering: {
            opacity: 0,
            animation: "fadeIn 0.6s ease-out forwards",
          },
          exiting: {
            animation: "fadeOut 0.6s ease-in forwards",
          },
        };
    }
  };

  // Smooth progress tracking with requestAnimationFrame
  const updateProgress = useCallback(() => {
    if (!animationStartTime.current) return;

    const elapsed = Date.now() - animationStartTime.current;
    const newRemaining = Math.max(0, animationDuration - elapsed);
    setRemainingTime(newRemaining);

    if (newRemaining > 0) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, [animationDuration]);

  // Handle video loading and playback
  const handleVideoLoad = useCallback(() => {
    if (videoRef.current && videoState.isLoaded) {
      videoRef.current
        .play()
        .then(() => {
          setVideoState((prev) => ({ ...prev, isPlaying: true }));
        })
        .catch((error) => {
          console.warn("Video autoplay failed:", error);
          // Fallback: mute and try again
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().then(() => {
              setVideoState((prev) => ({ ...prev, isPlaying: true }));
            });
          }
        });
    }
  }, [videoState.isLoaded]);

  // Handle animation lifecycle
  useEffect(() => {
    if (!isVisible) {
      // Clean up when not visible
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    setAnimationState("entering");
    setRemainingTime(animationDuration);
    animationStartTime.current = Date.now();

    // Start progress tracking
    const startProgress = () => {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    // Small delay to ensure DOM is ready
    const progressTimeout = setTimeout(startProgress, 100);

    // Set exit timeout
    timerRef.current = setTimeout(() => {
      handleExit();
    }, animationDuration);

    // Handle video if enabled
    if (enableVideo && videoSrc && videoState.isLoaded) {
      // Small delay to sync with animation
      const videoTimeout = setTimeout(handleVideoLoad, 300);
      return () => clearTimeout(videoTimeout);
    }

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(progressTimeout);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isVisible,
    animationDuration,
    enableVideo,
    videoSrc,
    videoState.isLoaded,
    updateProgress,
    handleVideoLoad,
  ]);

  const handleExit = useCallback(() => {
    if (animationState === "exiting") return;

    setAnimationState("exiting");

    // Pause video gracefully
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Wait for exit animation to complete
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      setAnimationState("entering");
      setVideoState({
        isLoaded: false,
        isPlaying: false,
        hasError: false,
      });
      onAnimationEnd();
    }, 800);

    return () => clearTimeout(exitTimer);
  }, [animationState, setIsVisible, onAnimationEnd]);

  const handleClose = () => {
    handleExit();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleExit();
    }
  };

  // Handle video events
  const handleVideoCanPlay = () => {
    setVideoState((prev) => ({ ...prev, isLoaded: true }));
  };

  const handleVideoError = () => {
    setVideoState((prev) => ({ ...prev, hasError: true }));
  };

  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  if (!isVisible) return null;

  const animationStyles = getAnimationStyles();
  const progressPercentage =
    ((animationDuration - remainingTime) / animationDuration) * 100;

  return (
    <>
      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes slideUpIn {
          from {
            transform: translateY(100vh);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideDownOut {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100vh);
            opacity: 0;
          }
        }

        @keyframes slideLeftIn {
          from {
            transform: translateX(100vw);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideRightOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100vw);
            opacity: 0;
          }
        }

        @keyframes zoomIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes zoomOut {
          from {
            transform: scale(1);
            opacity: 1;
          }
          to {
            transform: scale(0.8);
            opacity: 0;
          }
        }

        @keyframes blurIn {
          from {
            filter: blur(20px);
            opacity: 0;
          }
          to {
            filter: blur(0);
            opacity: 1;
          }
        }

        @keyframes blurOut {
          from {
            filter: blur(0);
            opacity: 1;
          }
          to {
            filter: blur(20px);
            opacity: 0;
          }
        }

        @keyframes progressShimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes videoFadeIn {
          from {
            opacity: 0;
            filter: brightness(0.5) blur(5px);
          }
          to {
            opacity: 1;
            filter: brightness(0.8) blur(0);
          }
        }

        .backdrop-glass {
          backdrop-filter: blur(12px) saturate(180%);
          background: rgba(0, 0, 0, 0.75);
        }

        .content-wrapper {
          transform-origin: center center;
          will-change: transform, opacity;
        }

        .video-container {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.8);
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
          animation: videoFadeIn 1.2s ease-out forwards;
        }

        .video-loading-placeholder {
          background: linear-gradient(45deg, #1a1a2e 0%, #16213e 100%);
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.8;
          }
        }

        .progress-track {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          transition: width 0.1s linear;
          position: relative;
        }

        .progress-fill::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: progressShimmer 2s infinite;
        }

        .video-load-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 14px;
          background: rgba(0, 0, 0, 0.7);
          padding: 8px 16px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          z-index: 10;
        }
      `}</style>

      {/* Main container */}
      <div
        className="fixed top-0 left-0 w-full h-full inset-0 z-[9999]"
        onClick={handleBackdropClick}
        style={{
          animation:
            animationState === "entering"
              ? "fadeIn 0.5s ease-out forwards"
              : "fadeOut 0.5s ease-in forwards",
        }}
      >
        {/* Glass backdrop */}
        <div className="absolute inset-0 backdrop-glass" />

        {/* Close button */}
        <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
          {/* Video status indicator */}
          {enableVideo && !videoState.isPlaying && (
            <div className="text-white text-sm bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
              {videoState.hasError ? "Video Error" : "Loading..."}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={handleClose}
            className="group p-3 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all duration-300 transform hover:scale-110 active:scale-95"
            aria-label="Close animation"
          >
            <svg
              className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content container */}
        <div className="fixed top-0 inset-0 w-full h-full overflow-hidden">
          {/* Video background (optional) */}
          {enableVideo && videoSrc && (
            <div className="absolute inset-0 overflow-hidden">
              {/* Video loading placeholder */}
              {!videoState.isLoaded && !videoState.hasError && (
                <div className="absolute inset-0 video-loading-placeholder" />
              )}

              {/* Video error placeholder */}
              {videoState.hasError && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                  <div className="text-white text-center p-6">
                    <svg
                      className="w-12 h-12 mx-auto mb-3 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm">Video unavailable</p>
                  </div>
                </div>
              )}

              {/* Actual video */}
              <video
                ref={videoRef}
                autoPlay
                loop
                playsInline
                // muted
                preload="auto"
                className="video-container"
                style={{
                  opacity: videoState.isLoaded ? 1 : 0,
                  transition: "opacity 0.8s ease-out",
                }}
                onCanPlay={handleVideoCanPlay}
                onError={handleVideoError}
                onEnded={handleVideoEnded}
                onLoadedData={handleVideoCanPlay}
              >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60" />
            </div>
          )}

          {/* Content container */}
          <div
            ref={contentRef}
            className="absolute top-0 left-0 w-full h-full inset-0 flex items-center justify-center p-4"
            style={animationStyles[animationState]}
          >
            {/* Main content */}
            <div className="content-wrapper relative w-full max-w-7xl h-full max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
              {/* Render the passed component */}
              <div className="w-full h-full">{component}</div>
            </div>
          </div>
        </div>

        {showProgress && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-2xl z-50">
            {/* Progress bar */}
            <div className="progress-track mb-3">
              <div
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Timer and controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Time remaining */}
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-black/40 backdrop-blur-sm">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-white font-mono font-semibold text-sm">
                    {Math.ceil(remainingTime / 1000)}s
                  </span>
                </div>

                {/* Animation info */}
                <div className="text-white/80 text-sm">
                  {animationState === "entering" ? "Entering..." : "Exiting..."}
                  {enableVideo &&
                    !videoState.isPlaying &&
                    !videoState.hasError &&
                    " • Video loading..."}
                </div>
              </div>

              {/* Total duration */}
              <div className="text-white/60 text-sm">
                Total: {animationDuration / 1000}s
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AnimationHelper;
