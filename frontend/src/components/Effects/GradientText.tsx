import React, { useState } from "react";

interface AnimatedGradientTextProps {
  /** Text to display */
  text: string;

  /** If true → gradient animation is always visible */
  alwaysAnimate?: boolean;

  /** Optional text size (Tailwind compatible) */
  className?: string;
}

const AnimatedGradientText: React.FC<AnimatedGradientTextProps> = ({
  text,
  alwaysAnimate = false,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Show animation only on hover OR always if enabled
  const shouldAnimate = alwaysAnimate || isHovered;

  return (
    <>
      {/* Local animation CSS */}
      <style>
        {`
          @keyframes textclip {
            to {
              background-position: 200% center;
            }
          }
        `}
      </style>

      <h1
        className={`
          inline-block
          font-bold
          cursor-pointer
          transition-all
          duration-300
          ${className}
          ${shouldAnimate ? "text-transparent bg-clip-text" : "text-white"}
        `}
        style={
          shouldAnimate
            ? {
                backgroundImage:
                  "linear-gradient(to right, #095fab 10%, #25abe8 50%, #57d75b 60%)",
                backgroundSize: "200% auto",
                animation: "textclip 1.5s linear infinite",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }
            : {}
        }
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {text}
      </h1>
    </>
  );
};

export default AnimatedGradientText;
