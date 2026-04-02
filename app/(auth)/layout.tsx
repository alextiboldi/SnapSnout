import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-clay blueprint-grid flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <Image
          src="/snapsout-logo.png"
          alt="SnapSnout"
          width={48}
          height={48}
        />
        <h1 className="text-3xl md:text-4xl font-[800] italic text-primary font-headline tracking-tight">
          SnapSnout
        </h1>
      </div>
      {children}
    </div>
  );
}
