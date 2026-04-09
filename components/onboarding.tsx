"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const slideConfig = [
  {
    emoji: "\ud83d\udc3e",
    titleKey: "slide1Title" as const,
    subtitleKey: "slide1Subtitle" as const,
    accent: "bg-primary-container/20",
  },
  {
    emoji: "\ud83d\udc8c",
    titleKey: "slide2Title" as const,
    subtitleKey: "slide2Subtitle" as const,
    accent: "bg-secondary-fixed/20",
  },
  {
    emoji: "\ud83c\udfe0",
    titleKey: "slide3Title" as const,
    subtitleKey: "slide3Subtitle" as const,
    accent: "bg-tertiary-container/20",
    cta: true,
  },
];

export function Onboarding() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const complete = useCallback(() => {
    localStorage.setItem("snapsnout_onboarding_seen", "true");
    router.push("/create-pet");
  }, [router]);

  const skip = useCallback(() => {
    localStorage.setItem("snapsnout_onboarding_seen", "true");
    router.push("/create-pet");
  }, [router]);

  // Belt-and-suspenders: if onboarding has already been seen, never render.
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (localStorage.getItem("snapsnout_onboarding_seen") === "true") {
      setDismissed(true);
    }
  }, []);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slideConfig.length - 1));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold) {
      goNext();
    } else if (diff < -threshold) {
      goPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }, [goNext, goPrev]);

  if (dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-[99998] overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #fffcf7 0%, #f6f4ec 40%, #eae9dd 100%)",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip button */}
      {currentSlide < slideConfig.length - 1 && (
        <button
          onClick={skip}
          className="absolute top-4 right-4 z-10 rounded-full px-4 py-2 font-label text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
        >
          {tc("skip")}
        </button>
      )}

      {/* Slide track */}
      <div
        className="flex h-full"
        style={{
          transform: `translateX(${-currentSlide * 100}%)`,
          transition: "transform 0.3s ease",
        }}
      >
        {slideConfig.map((slide, index) => (
          <div
            key={index}
            className="flex h-full w-full flex-none flex-col items-center justify-center px-8"
          >
            {/* Decorative circle + emoji */}
            <div className="mb-12 flex items-center justify-center">
              <div
                className={`flex h-32 w-32 items-center justify-center rounded-full ${slide.accent}`}
              >
                <span className="text-6xl" role="img" aria-hidden="true">
                  {slide.emoji}
                </span>
              </div>
            </div>

            {/* Text content */}
            <div className="flex max-w-sm flex-col items-center text-center">
              <h2 className="font-headline text-3xl font-bold italic text-primary">
                {t(slide.titleKey)}
              </h2>
              <p className="mt-3 font-body text-base leading-relaxed text-on-surface-variant">
                {t(slide.subtitleKey)}
              </p>

              {slide.cta && (
                <button
                  onClick={complete}
                  className="btn-butter spring-active mt-8 rounded-full px-8 py-3.5 font-label text-sm font-bold tracking-wide text-on-secondary-fixed shadow-ambient transition-shadow hover:shadow-ambient-lg"
                >
                  {t("addMyPet")}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-2.5">
        {slideConfig.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "h-2.5 w-2.5 bg-primary"
                : "h-2 w-2 bg-outline-variant/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
