"use client";

import { useState, useEffect } from "react";
import { Onboarding } from "@/components/onboarding";

const ONBOARDING_SEEN_KEY = "snapsnout_onboarding_seen";

export function AppShell({
  showOnboarding,
  children,
}: {
  showOnboarding: boolean;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [alreadySeen, setAlreadySeen] = useState(true);

  useEffect(() => {
    setAlreadySeen(localStorage.getItem(ONBOARDING_SEEN_KEY) === "true");
    // Wait for splash to finish before showing onboarding
    const timer = setTimeout(() => setReady(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {ready && showOnboarding && !alreadySeen && <Onboarding />}
      {children}
    </>
  );
}
