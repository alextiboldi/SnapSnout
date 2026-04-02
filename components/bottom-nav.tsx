"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";

const tabs = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/milestones", icon: "timeline", label: "Milestones" },
  { href: "/studio", icon: "auto_awesome", label: "Studio" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 rounded-t-[2rem] md:rounded-t-[3rem] bg-primary shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
      <div className="flex justify-around items-center px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center p-3 transition-all active:scale-90 duration-300 ${
                isActive
                  ? "bg-secondary-fixed text-primary rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                  : "text-clay/80 hover:text-white"
              }`}
            >
              <Icon name={tab.icon} filled={isActive} className="text-2xl" />
              <span className="font-label uppercase text-[10px] tracking-widest mt-1">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
