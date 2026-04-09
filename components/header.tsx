import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export async function Header() {
  const tc = await getTranslations("common");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass shadow-ambient">
      <div className="flex items-center px-4 py-3 md:px-6 md:py-4 w-full max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 md:gap-3">
          <Image
            src="/snapsout-logo.png"
            alt="SnapSnout"
            width={36}
            height={36}
            className="w-8 h-8 md:w-9 md:h-9"
          />
          <h1 className="text-2xl md:text-3xl font-[800] italic text-primary font-headline tracking-tight">
            {tc("appName")}
          </h1>
        </Link>
      </div>
    </header>
  );
}
