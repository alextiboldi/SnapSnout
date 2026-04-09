import type { Metadata, Viewport } from "next";
import {
  Plus_Jakarta_Sans,
  Manrope,
  Space_Grotesk,
  Fredoka,
  Nunito,
} from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { SplashScreen } from "@/components/splash-screen";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["400", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-label",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// Pawprint Clay overhaul — playful, family-friendly pair.
// See docs/design-system.md.
const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-friendly",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SnapSnout — Pet Milestone Tracker",
  description:
    "Track your pet's age, milestones, and growth with beautiful shareable milestone cards.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#fffcf7",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${manrope.variable} ${spaceGrotesk.variable} ${fredoka.variable} ${nunito.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <SplashScreen />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
