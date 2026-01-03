import React, { useState, useRef } from "react";

const SecureAccessPanel = ({ onAccessGranted }) => {
  const [code, setCode] = useState(["*", "*", "*", "*", "*", "*"]);
  const [isCracking, setIsCracking] = useState(false);
  const [status, setStatus] = useState("Enter 6-digit code...");
  const [isGranted, setIsGranted] = useState(false);
  const [inputIndex, setInputIndex] = useState(0);
  const [isCrashing, setIsCrashing] = useState(false);
  const codeRefs = useRef([]);
  const containerRef = useRef(null);

  const characters = [
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    ..."abcdefghijklmnopqrstuvwxyz",
    ..."0123456789",
    ..."!@#$%^&*()_+-=[]{}|;:,.<>?/",
  ];

  const handleNumberClick = (num) => {
    if (isCracking || isGranted || inputIndex >= 6 || isCrashing) return;

    const newCode = [...code];
    newCode[inputIndex] = num;
    setCode(newCode);

    if (inputIndex < 5) {
      setInputIndex(inputIndex + 1);
    }
  };

  const handleBackspace = () => {
    if (isCracking || isGranted || inputIndex === 0 || isCrashing) return;

    const newIndex = inputIndex - 1;
    const newCode = [...code];
    newCode[newIndex] = "*";
    setCode(newCode);
    setInputIndex(newIndex);
  };

  const handleEnter = async () => {
    if (isCracking || isGranted || inputIndex !== 6 || isCrashing) return;

    setIsCracking(true);
    setStatus("Cracking in progress...");

    // Animate each digit
    const crackPromises = codeRefs.current.map((charEl, index) => {
      return scrambleChar(charEl, 1000 + index * 200);
    });

    await Promise.all(crackPromises);

    // Check if code is correct
    const enteredCode = code.join("");
    if (enteredCode === "234567") {
      setStatus("PERMISSION GRANTED!");
      setIsGranted(true);

      // Success animation
      codeRefs.current.forEach((charEl) => {
        if (charEl) {
          charEl.classList.remove(
            "border-red-400/80",
            "text-red-500",
            "bg-red-500/10"
          );
          charEl.classList.add(
            "border-cyan-400",
            "text-cyan-300",
            "bg-cyan-500/20",
            "shadow-[0_0_20px_rgba(0,255,255,0.5)]"
          );
        }
      });

      // Call the parent callback
      if (onAccessGranted) {
        onAccessGranted();
      }
    } else {
      // Crash animation
      setStatus("ACCESS DENIED - SYSTEM CRASHED");
      setIsCrashing(true);
      await crashAnimation();
      resetCode();
      setIsCrashing(false);
    }

    setIsCracking(false);
  };

  const scrambleChar = (charEl, duration) => {
    return new Promise((resolve) => {
      charEl.classList.add("animate-flicker");
      let scrambleInterval;

      const scrambleDuration = duration - 400;
      let startTime = Date.now();

      scrambleInterval = setInterval(() => {
        const randomChar =
          characters[Math.floor(Math.random() * characters.length)];
        charEl.textContent = randomChar;

        if (Date.now() - startTime >= scrambleDuration) {
          clearInterval(scrambleInterval);
          charEl.classList.add(
            "relative",
            "before:absolute",
            "before:top-0",
            "before:-left-full",
            "before:w-full",
            "before:h-full",
            "before:animate-shimmer",
            "before:bg-gradient-to-r",
            "before:from-transparent",
            "before:via-white",
            "before:to-transparent",
            "before:mix-blend-overlay"
          );

          setTimeout(() => {
            charEl.classList.remove(
              "animate-flicker",
              "relative",
              "before:absolute",
              "before:top-0",
              "before:-left-full",
              "before:w-full",
              "before:h-full",
              "before:animate-shimmer",
              "before:bg-gradient-to-r",
              "before:from-transparent",
              "before:via-white",
              "before:to-transparent",
              "before:mix-blend-overlay"
            );
            const finalChar =
              characters[Math.floor(Math.random() * characters.length)];
            charEl.textContent = finalChar;
            charEl.classList.add(
              "bg-amber-500/10",
              "text-amber-300",
              "border-amber-400"
            );
            resolve();
          }, 400);
        }
      }, 50);
    });
  };

  const crashAnimation = () => {
    return new Promise((resolve) => {
      if (containerRef.current) {
        containerRef.current.classList.add(
          "animate-crashShake",
          "animate-crashRed"
        );

        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.classList.remove(
              "animate-crashShake",
              "animate-crashRed"
            );
          }
          resolve();
        }, 2000);
      }
    });
  };

  const resetCode = () => {
    if (isCracking) return;

    setCode(["*", "*", "*", "*", "*", "*"]);
    setInputIndex(0);
    setIsGranted(false);
    setStatus("Enter 6-digit code...");

    codeRefs.current.forEach((charEl) => {
      if (charEl) {
        charEl.classList.remove(
          "bg-amber-500/10",
          "text-amber-300",
          "border-amber-400",
          "bg-cyan-500/20",
          "text-cyan-300",
          "border-cyan-400",
          "animate-flicker"
        );
        charEl.classList.add(
          "bg-red-500/10",
          "text-red-500",
          "border-red-400/80"
        );
        charEl.textContent = "*";
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center border-l border-red-400/30 font-orbitron relative overflow-hidden"
    >
      <div className="w-full max-w-md p-8 rounded-2xl bg-gray-900/90 border border-red-400/20 shadow-2xl relative">
        <div
          className={`text-center mb-8 h-6 font-bold text-lg transition-all duration-300 ${
            isGranted
              ? "text-cyan-300 text-shadow-cyan"
              : isCrashing
              ? "text-red-400 animate-pulse"
              : "text-red-400"
          }`}
        >
          {status}
        </div>

        <div className="flex justify-center gap-4 mb-10">
          {code.map((digit, index) => (
            <div
              key={index}
              ref={(el) => (codeRefs.current[index] = el)}
              className={`w-16 h-20 rounded-lg border-b-2 flex items-center justify-center text-4xl font-bold font-share-tech-mono transition-all duration-300 select-none
                ${
                  index < inputIndex && !isGranted
                    ? "animate-pulse scale-110"
                    : ""
                }
                ${
                  !isGranted
                    ? "bg-red-500/10 text-red-500 border-red-400/80 shadow-inner-red"
                    : ""
                }`}
            >
              {digit}
            </div>
          ))}
        </div>

        <div className="mb-8">
          <div className="flex justify-center gap-3 mb-3">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-900/50 to-gray-900 text-red-400 border border-red-400/40 font-bold text-2xl
                  transition-all duration-200 hover:from-purple-800/50 hover:to-gray-800 hover:shadow-red-glow hover:-translate-y-1
                  disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                onClick={() => handleNumberClick(num.toString())}
                disabled={isCracking || isGranted || isCrashing}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-3 mb-3">
            {[4, 5, 6].map((num) => (
              <button
                key={num}
                className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-900/50 to-gray-900 text-red-400 border border-red-400/40 font-bold text-2xl
                  transition-all duration-200 hover:from-purple-800/50 hover:to-gray-800 hover:shadow-red-glow hover:-translate-y-1
                  disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                onClick={() => handleNumberClick(num.toString())}
                disabled={isCracking || isGranted || isCrashing}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-3 mb-3">
            {[7, 8, 9].map((num) => (
              <button
                key={num}
                className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-900/50 to-gray-900 text-red-400 border border-red-400/40 font-bold text-2xl
                  transition-all duration-200 hover:from-purple-800/50 hover:to-gray-800 hover:shadow-red-glow hover:-translate-y-1
                  disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                onClick={() => handleNumberClick(num.toString())}
                disabled={isCracking || isGranted || isCrashing}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-3">
            <button
              className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-900/50 to-gray-900 text-red-400 border border-red-400/40 font-bold text-2xl
                transition-all duration-200 hover:from-purple-800/50 hover:to-gray-800 hover:shadow-red-glow hover:-translate-y-1
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              onClick={handleBackspace}
              disabled={isCracking || isGranted || isCrashing}
            >
              ⌫
            </button>
            <button
              className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-900/50 to-gray-900 text-red-400 border border-red-400/40 font-bold text-2xl
                transition-all duration-200 hover:from-purple-800/50 hover:to-gray-800 hover:shadow-red-glow hover:-translate-y-1
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              onClick={() => handleNumberClick("0")}
              disabled={isCracking || isGranted || isCrashing}
            >
              0
            </button>
            <button
              className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-900/50 to-gray-900 text-cyan-300 border border-cyan-400/40 font-bold text-base
                transition-all duration-200 hover:from-cyan-800/50 hover:to-gray-800 hover:shadow-cyan-glow hover:-translate-y-1
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              onClick={handleEnter}
              disabled={
                isCracking || isGranted || inputIndex !== 6 || isCrashing
              }
            >
              ENTER
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            className="px-8 py-3 rounded-lg bg-gradient-to-br from-purple-900/50 to-gray-900 text-red-400 border border-red-400/40 font-bold uppercase
              transition-all duration-300 hover:from-purple-800/50 hover:to-gray-800 hover:shadow-red-glow hover:-translate-y-1
              disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            onClick={resetCode}
            disabled={isCracking}
          >
            Reset
          </button>
        </div>

        {isGranted && (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-black/90 rounded-2xl flex items-center justify-center animate-fadeIn">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-300 animate-pulse-granted text-shadow-cyan">
                SYSTEM ACCESS GRANTED
              </div>
              <div className="text-lg mt-3 text-cyan-200/80">
                Welcome, authorized user
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecureAccessPanel;
