import React, { useState, useEffect } from "react";
import { Joyride, STATUS, EVENTS } from "react-joyride";
import Confetti from "react-confetti";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";

const OnboardingTour = () => {
  const { user, tourTriggered, setTourTriggered } = useAuth();

  const location = useLocation();

  const userRole = (user?.role || "").toUpperCase();
  const isOwner = userRole === "OWNER";

  const isEligiblePage = isOwner
    ? location.pathname.toLowerCase().includes("owner") ||
      location.pathname.toLowerCase().includes("landing")
    : location.pathname.toLowerCase().includes("landing") ||
      location.pathname.toLowerCase().includes("customer") ||
      location.pathname.toLowerCase().includes("saved-items") ||
      location.pathname.toLowerCase().includes("profile");

  const canRun = tourTriggered || isEligiblePage;

  const [run, setRun] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const customerSteps = [
    {
      target: "body",
      placement: "center",
      title: `Welcome, ${user?.firstName || user?.name || "Shopper"} 👋`,
      content:
        "Let's take a quick tour of your new shopping hub! We have some awesome features tailored just for you.",
      disableBeacon: true,
    },
    {
      target: ".tour-marketplace",
      title: "Your Dashboard",
      content:
        "Click here anytime to track your spending and see all your awesome activity!",
      placement: "bottom",
    },
    {
      target: ".tour-profile",
      title: "Profile & Badges",
      content:
        "Check your profile to see your shopper status, drop reviews, and earn exclusive Campus Legend badges!",
      placement: "bottom",
    },
    {
      target: ".tour-sell-item",
      title: "Room Simulator",
      content:
        "Visualize how furniture and items look in your space before you buy them using our cutting-edge 3D Simulator!",
      placement: "bottom-start",
    },
  ];

  const ownerSteps = [
    {
      target: "body",
      placement: "center",
      title: `Welcome to your Shop, ${user?.firstName || user?.name || "Owner"} 🏪`,
      content:
        "Ready to hustle? This quick tour will show you how to manage your business like a pro.",
      disableBeacon: true,
    },
    {
      target: ".tour-marketplace",
      title: "Business Analytics",
      content:
        "Track your sales, view active orders, and see AI insights about your business performance.",
      placement: "bottom",
    },
    {
      target: ".tour-sell-item",
      title: "Manage Inventory",
      content:
        "Easily add new products, update prices, and track your stock levels in your shop editor.",
      placement: "bottom",
    },
    {
      target: ".tour-profile",
      title: "Your Details",
      content:
        "Manage your owner profile, update public details, and securely adjust your payout settings.",
      placement: "bottom-start",
    },
  ];

  const steps = isOwner ? ownerSteps : customerSteps;

  useEffect(() => {
    if (!user || !canRun) return;

    if (user.isFirstLogin || tourTriggered) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    user,
    user?.isFirstLogin,
    tourTriggered,
    isOwner,
    canRun,
    location.pathname,
  ]);

  const handleJoyrideCallback = (data) => {
    const { status, type, action } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (status === STATUS.FINISHED) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }

    if (action === "close" || type === EVENTS.TOUR_END) {
      setRun(false);
      setTourTriggered(false);
    }
  };

  const skipTourTemporarily = () => setRun(false);

  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const CustomTooltip = ({
    index,
    step,
    backProps,
    closeProps,
    primaryProps,
    skipProps,
    tooltipProps,
    isLastStep,
    size,
  }) => {
    if (!step) return null;
    const progressPercent = ((index + 1) / size) * 100;

    return (
      <div
        {...tooltipProps}
        className="w-80 sm:w-96 rounded-2xl border border-white/40 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 flex flex-col font-sans transition-all duration-300 ease-in-out relative overflow-hidden"
        style={{
          zIndex: 99999,
          ...tooltipProps.style,
        }}
      >
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#051094]/10 rounded-full blur-3xl" />

        <button
          {...closeProps}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors z-10"
          aria-label="Close Tour"
        >
          <X size={20} />
        </button>

        <div className="mb-2 relative z-10">
          <h3 className="text-2xl font-bold mb-1 tracking-tight text-slate-900 drop-shadow-sm">
            {step.title}
          </h3>
          <p className="text-[15px] font-medium text-slate-600 leading-relaxed">
            {step.content}
          </p>
        </div>

        <div className="mt-5 mb-6 relative z-10">
          <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-500 uppercase tracking-widest">
            <span>
              Step {index + 1} of {size}
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
            <div
              className="bg-[#051094] h-2 rounded-full transition-all duration-700 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 relative z-10">
          {index === 0 ? (
            <button
              onClick={skipTourTemporarily}
              className="text-[13px] font-bold text-slate-500 hover:text-[#051094] transition-colors"
            >
              Remind me later
            </button>
          ) : (
            <button
              {...skipProps}
              className="text-[13px] font-bold text-slate-500 hover:text-red-500 transition-colors"
            >
              Skip Tour
            </button>
          )}

          <div className="flex space-x-2">
            {index > 0 && (
              <button
                {...backProps}
                className="px-4 py-2 hover:-translate-y-[1px] text-sm font-semibold rounded-xl text-[#051094] bg-white border shadow-sm border-slate-200 hover:bg-slate-50 active:scale-95 transition-all duration-200"
              >
                Back
              </button>
            )}
            <button
              {...primaryProps}
              className="px-5 py-2 hover:-translate-y-[1px] text-sm font-semibold rounded-xl text-white bg-[#051094] hover:bg-[#040c75] active:scale-95 shadow-[0_8px_16px_rgba(5,16,148,0.25)] hover:shadow-[0_12px_20px_rgba(5,16,148,0.3)] transition-all duration-200"
            >
              {isLastStep ? "Get Started" : "Next"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous={true}
        showProgress={false}
        showSkipButton={true}
        disableOverlayClose={true}
        spotlightPadding={10}
        callback={handleJoyrideCallback}
        tooltipComponent={CustomTooltip}
        styles={{
          options: {
            zIndex: 10000,
            arrowColor: "rgba(255, 255, 255, 0.7)",
          },
          overlay: {
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(2px)",
          },
          spotlight: {
            borderRadius: "16px",
            boxShadow: "0 0 0 10px rgba(255,255,255,0.1)",
          },
        }}
      />
      {showConfetti && (
        <div className="fixed inset-0 z-[10001] pointer-events-none">
          <Confetti
            width={windowDimension.width}
            height={windowDimension.height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.15}
            initialVelocityY={20}
            colors={[
              "#051094",
              "#4F46E5",
              "#60A5FA",
              "#FBBF24",
              "#F472B6",
              "#FFFFFF",
            ]}
          />
        </div>
      )}
    </>
  );
};

export default OnboardingTour;
