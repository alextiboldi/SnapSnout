"use client";

import { useState, useEffect } from "react";
import { SplashScreen } from "@/components/splash-screen";
import { Onboarding } from "@/components/onboarding";

export function AppShell({
  showOnboarding,
  children,
}: {
  showOnboarding: boolean;
  children: React.ReactNode;
}) {
  const [splashDone, setSplashDone] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState(true); // default true to avoid flash

  useEffect(() => {
    setOnboardingSeen(!!localStorage.getItem("snapsnout_onboarding_seen"));
    const timer = setTimeout(() => setSplashDone(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SplashScreen />
      {splashDone && showOnboarding && !onboardingSeen && <Onboarding />}
      {children}
    </>
  );
}
