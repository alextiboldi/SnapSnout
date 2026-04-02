"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "./icon";
import { signOut } from "@/lib/actions/auth";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass shadow-ambient">
      <div className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4 w-full max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 md:gap-3">
          <Image
            src="/snapsout-logo.png"
            alt="SnapSnout"
            width={36}
            height={36}
            className="w-8 h-8 md:w-9 md:h-9"
          />
          <h1 className="text-2xl md:text-3xl font-[800] italic text-primary font-headline tracking-tight">
            SnapSnout
          </h1>
        </Link>
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface-container-highest overflow-hidden border-2 border-primary/20 flex items-center justify-center hover:border-primary/40 transition-colors"
          >
            <Icon name="person" className="text-on-surface-variant text-lg" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-12 z-50 w-48 bg-surface-container-lowest irregular-border-sm shadow-ambient-lg p-2">
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container transition-colors font-body text-sm text-on-surface"
                >
                  <Icon name="settings" className="text-lg text-on-surface-variant" />
                  Settings
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container transition-colors font-body text-sm text-on-surface"
                  >
                    <Icon name="logout" className="text-lg text-on-surface-variant" />
                    Sign out
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
