"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export function SplashScreen() {
  const t = useTranslations("common");
  const [splashVisible, setSplashVisible] = useState(false);
  const [splashMounted, setSplashMounted] = useState(false);

  useEffect(() => {
    // Only show splash once per browser session
    if (sessionStorage.getItem("snapsnout_splash_seen")) return;
    sessionStorage.setItem("snapsnout_splash_seen", "1");

    setSplashMounted(true);
    setSplashVisible(true);

    const fadeTimer = setTimeout(() => setSplashVisible(false), 2000);
    const unmountTimer = setTimeout(() => setSplashMounted(false), 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!splashMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center transition-opacity duration-500 ${
        splashVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        background:
          "linear-gradient(180deg, #fffcf7 0%, #f6f4ec 40%, #eae9dd 100%)",
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <img
          src="/snapsout-logo.png"
          alt="SnapSnout logo"
          width={48}
          height={48}
          className="animate-bounce-gentle"
        />
        <h1 className="font-headline text-3xl font-[800] italic tracking-tight text-primary">
          {t("appName")}
        </h1>
        <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
          {t("tagline")}
        </p>
      </div>
    </div>
  );
}
