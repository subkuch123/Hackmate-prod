import { useState, useEffect } from "react";
import "./App.css";
import KeyPad from "./component/keyPd";
import SecureAccessPanel from "./component/keyPd";

function App() {
  const [isAccessScreen, setIsAccessScreen] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [message, setMessage] = useState("Access Denied");
  const [showKeypad, setShowKeypad] = useState(false);
  const [isCracking, setIsCracking] = useState(false);
  const [pageSplit, setPageSplit] = useState(false);

  const correctCode = "245367";

  const handleNumberClick = (num) => {
    if (isCracking) return;

    if (accessCode.length < 6) {
      const newCode = accessCode + num;
      setAccessCode(newCode);
    }
  };

  const handleBackspace = () => {
    if (isCracking) return;

    if (accessCode.length > 0) {
      setAccessCode(accessCode.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (isCracking) return;

    setAccessCode("");
    setMessage("Enter Code...");
  };

  const handleSubmit = () => {
    if (isCracking || accessCode.length !== 6) return;

    // Start cracking animation
    setIsCracking(true);
    setMessage("Cracking Code...");

    // Simulate cracking process
    setTimeout(() => {
      if (accessCode === correctCode) {
        setAccessGranted(true);
        setMessage("Access Granted!");

        // Split page effect
        setTimeout(() => {
          setPageSplit(true);
        }, 500);

        setTimeout(() => {
          setIsAccessScreen(false);
          setShowKeypad(false);
          setIsCracking(false);
        }, 2000);
      } else {
        setMessage("Access Denied!");
        setIsCracking(false);

        // Reset after showing denial
        setTimeout(() => {
          setAccessCode("");
          setMessage("Wrong Code! Try Again");
        }, 1500);

        // Clear completely after delay
        setTimeout(() => {
          setAccessCode("");
          setMessage("Enter Code...");
        }, 3000);
      }
    }, 2000); // 2-second cracking simulation
  };

  const handleKeyPress = (e) => {
    if (!isAccessScreen || !showKeypad || isCracking) return;

    if (e.key >= "0" && e.key <= "9") {
      handleNumberClick(e.key);
    } else if (e.key === "Backspace") {
      handleBackspace();
    } else if (e.key === "Escape") {
      handleClear();
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [accessCode, isAccessScreen, showKeypad, isCracking]);

  const handleChestClick = () => {
    setPageSplit(false);
    setIsAccessScreen(true);
    setShowKeypad(true);
    setAccessCode("");
    setAccessGranted(false);
    setMessage("Enter Code...");
    setIsCracking(false);
  };

  const handleCloseAccessScreen = () => {
    setIsAccessScreen(false);
    setShowKeypad(false);
    setAccessCode("");
    setMessage("Access Denied");
    setIsCracking(false);
  };

  return (
    <>
      {/* Split page effect */}
      <div className={`page-split-container ${pageSplit ? "split" : ""}`}>
        <div className="page-half left-half"></div>
        <div className="page-divider"></div>
        <div className="page-half right-half"></div>
      </div>

      <div
        className={`flex w-full h-screen justify-center items-center bg-gradient-to-b from-gray-800 to-black ${
          pageSplit ? "hidden" : ""
        }`}
      >
        <div className="chest" onClick={handleChestClick}>
          <div className="chest__panel chest__panel--back"></div>
          <div className="chest__panel chest__panel--front">
            <div className="chest__panel chest__panel--front-frame"></div>
          </div>
          <div className="chest__panel chest__panel--top"></div>
          <div className="chest__panel chest__panel--bottom"></div>
          <div className="chest__panel chest__panel--left"></div>
          <div className="chest__panel chest__panel--right"></div>

          {/* Drawers - Only open if access granted */}
          <div
            className={`chest-drawer chest-drawer--top ${
              accessGranted ? "chest-drawer--open" : ""
            }`}
          >
            <details open={accessGranted}>
              <summary></summary>
            </details>
            <div className="chest-drawer__structure">
              <div className="chest-drawer__panel chest-drawer__panel--left"></div>
              <div className="chest-drawer__panel chest-drawer__panel--right"></div>
              <div className="chest-drawer__panel chest-drawer__panel--bottom"></div>
              <div className="chest-drawer__panel chest-drawer__panel--back">
                CSS
              </div>
            </div>
          </div>
          <div
            className={`chest-drawer chest-drawer--middle ${
              accessGranted ? "chest-drawer--open" : ""
            }`}
          >
            <details open={accessGranted}>
              <summary></summary>
            </details>
            <div className="chest-drawer__structure">
              <div className="chest-drawer__panel chest-drawer__panel--left"></div>
              <div className="chest-drawer__panel chest-drawer__panel--right"></div>
              <div className="chest-drawer__panel chest-drawer__panel--bottom"></div>
              <div className="chest-drawer__panel chest-drawer__panel--back">
                is
              </div>
            </div>
          </div>
          <div
            className={`chest-drawer chest-drawer--bottom ${
              accessGranted ? "chest-drawer--open" : ""
            }`}
          >
            <details open={accessGranted}>
              <summary></summary>
            </details>
            <div className="chest-drawer__structure">
              <div className="chest-drawer__panel chest-drawer__panel--left"></div>
              <div className="chest-drawer__panel chest-drawer__panel--right"></div>
              <div className="chest-drawer__panel chest-drawer__panel--bottom"></div>
              <div className="chest-drawer__panel chest-drawer__panel--back">
                Awesome
              </div>
            </div>
          </div>
        </div>

        {/* Access Screen Overlay */}
        {isAccessScreen && <SecureAccessPanel />}
      </div>
    </>
  );
}

export default App;
