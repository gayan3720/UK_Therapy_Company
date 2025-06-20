import React, { useEffect, useRef, useState } from "react";
import lottie from "lottie-web";
import animationData from "../../assets/animations/MenuTwo.json";

const LottieAnimationMenu = () => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const [step, setStep] = useState("start"); // 'start', 'middle', 'end'

  useEffect(() => {
    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: false,
      autoplay: false,
      animationData,
    });

    return () => animationRef.current?.destroy();
  }, []);

  const playSegment = (startFrame, endFrame, nextStep) => {
    if (!animationRef.current) return;
    animationRef.current.playSegments([startFrame, endFrame], true);
    setStep(nextStep);
  };

  const handleClick = () => {
    switch (step) {
      case "start":
        playSegment(0, 104, "end");
        break;
      case "end":
        playSegment(104, 0, "start");
        break;
      default:
        break;
    }

    // toggle between two middle states
    if (step === "middle") setStep("middle-close");
    else if (step === "middle-close") setStep("middle");
  };

  return (
    <div
      className="lottie-menu-icon"
      ref={containerRef}
      onClick={handleClick}
      style={{ width: 50, height: 50, cursor: "pointer" }}
    />
  );
};

export default LottieAnimationMenu;
