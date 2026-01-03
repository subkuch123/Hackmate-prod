import React, { useRef, useState, useEffect } from "react";

interface ShuffleToTextProps {
  fromText: string;
  toText: string;
  velocity?: number;
  autoStart?: boolean;
  className?: string;
}

const ShuffleToText: React.FC<ShuffleToTextProps> = ({
  fromText,
  toText,
  velocity = 40,
  autoStart = false,
  className = "",
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [hasTransformed, setHasTransformed] = useState(false);

  const shuffle = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);

  const startShuffle = () => {
    if (!ref.current || hasTransformed) return;

    let index = 0;
    const maxLength = Math.max(fromText.length, toText.length);

    intervalRef.current = setInterval(() => {
      const shuffled = shuffle(toText.split(""));

      for (let i = 0; i < index; i++) {
        shuffled[i] = toText[i] || "";
      }

      ref.current!.innerText = shuffled.join("").slice(0, maxLength);

      index++;

      if (index > toText.length) {
        stopShuffle();
        ref.current!.innerText = toText;
        setHasTransformed(true);
      }
    }, velocity);
  };

  const stopShuffle = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetText = () => {
    stopShuffle();
    setHasTransformed(false);
    if (ref.current) {
      ref.current.innerText = fromText;
    }
  };

  useEffect(() => {
    if (autoStart) startShuffle();
    return stopShuffle;
  }, []);

  return (
    <span
      ref={ref}
      className={`inline-block cursor-pointer select-none ${className}`}
      onMouseEnter={startShuffle}
      onMouseLeave={resetText}
    >
      {fromText}
    </span>
  );
};

export default ShuffleToText;
