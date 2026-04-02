"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";

const tabs = [
  { href: "/", icon: "home" },
  { href: "/milestones", icon: "flag" },
  { href: "/studio", icon: "auto_awesome" },
  { href: "/settings", icon: "settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 pointer-events-none pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex justify-center px-4 py-2">
        <div className="pointer-events-auto flex items-center gap-3 bg-[#1C1C1E] rounded-full px-4 py-1.5 shadow-[0_8px_32px_rgba(44,36,24,0.3),0_2px_8px_rgba(44,36,24,0.2)]">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center justify-center rounded-full transition-all duration-250 ease-out ${
                  isActive
                    ? "w-[46px] h-[46px] bg-primary text-white shadow-[0_4px_15px_rgba(154,81,30,0.4)]"
                    : "w-[40px] h-[40px] text-white/50 hover:text-white/80"
                }`}
              >
                <Icon
                  name={tab.icon}
                  filled={isActive}
                  className={isActive ? "text-[21px]" : "text-[20px]"}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
