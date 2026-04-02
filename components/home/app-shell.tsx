"use client";

import { useState, useEffect } from "react";
import { Onboarding } from "@/components/onboarding";

export function AppShell({
  showOnboarding,
  children,
}: {
  showOnboarding: boolean;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait for splash to finish before showing onboarding
    const timer = setTimeout(() => setReady(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {ready && showOnboarding && <Onboarding />}
      {children}
    </>
  );
}
