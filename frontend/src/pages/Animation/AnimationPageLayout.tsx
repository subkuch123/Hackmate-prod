import React, { useEffect, useState, useRef } from "react";
import { useAppSelector } from "@/hooks/authHook";
import { RootState } from "@/store";
import Karam_SANKET from "./Karam_SANKET";
import TestingWebsite from "./Testing";
import AnimationHelper from "./AnimationHelper";
import karm_SANKT_ENTRO_VIDEO from "../../assets/video/Karam_Sanket_ENTRO.mp4";
import TextReveal from "@/components/Effects/TextReveal";
const AnimationPageLayout: React.FC = () => {
  const { hackathonId, eventDetails } = useAppSelector(
    (state: RootState) => state.websocket
  );

  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [animationDuration, setAnimationDuration] = useState<number>(10000);

  // Use ReturnType<typeof setTimeout> for cross-environment typing
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [animationType, setAnimationType] = useState("slide-up");
  useEffect(() => {
    // If the event is KARAM_SANKET, start the animation for the provided duration (default 10s)
    if (eventDetails?.eventName === "KARAM_SANKET") {
      const duration: number = eventDetails.payload?.duration ?? 10000;
      setAnimationDuration(duration);
      setIsVisible(true);

      // clear previous timeout if any
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        timeoutRef.current = null;
      }, duration);
    }

    // Cleanup on unmount or when eventDetails changes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [eventDetails]);

  // If not the right event or not visible, render nothing

  const [eventDetail, setEventDetail] = useState(eventDetails?.eventName);
  if (eventDetails?.eventName === "KARAM_SANKET" || !isVisible) {
    return (
      // <Karam_SANKET
      //   isVisible={isVisible}
      //   setIsVisible={setIsVisible}
      //   animationDuration={animationDuration}
      // />
      <AnimationHelper
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        animationDuration={8000} // 8 seconds
        animationType={animationType}
        enableVideo={true}
        videoSrc={karm_SANKT_ENTRO_VIDEO}
        showProgress={false}
        onAnimationEnd={() => console.log("Animation completed")}
        component={
          <div className="absolute top-16">
            <TextReveal
              text="Its Time For"
              className="
                fire-text
                text-red-700
                text-2xl sm:text-3xl md:text-6xl
                tracking-[0.5rem]
                font-extrabold
                uppercase
                drop-shadow-[0_0_25px_rgba(255,0,0,0.9)]
              "
            />
          </div>
        }
      />
    );
  } else if (eventDetail === "TESTING") {
    return <TestingWebsite />;
  }
  return (
    // Render your animation component and pass handlers/props as required
    <></>
  );
};

export default AnimationPageLayout;
