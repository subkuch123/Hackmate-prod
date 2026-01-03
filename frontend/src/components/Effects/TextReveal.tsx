import { useEffect, useRef } from "react";
import baffle from "baffle";

type TextRevealProps = {
  text: string;
  className?: string;
  duration?: number; // reveal duration in ms
  speed?: number; // scrambling speed
};

const TextReveal: React.FC<TextRevealProps> = ({
  text,
  className = "",
  duration = 4000,
  speed = 120,
}) => {
  const textRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const b = baffle(textRef.current);

    b.set({
      characters: "░▒░ ░██░> ████▓ >█> ░/█>█ ██░░ █<▒ ▓██░ ░/░▒",
      speed,
    });

    b.start();
    b.reveal(duration);

    return () => {
      b.stop();
    };
  }, [duration, speed, text]);

  return (
    <span ref={textRef} className={`font-medium tracking-widest ${className}`}>
      {text}
    </span>
  );
};

export default TextReveal;
