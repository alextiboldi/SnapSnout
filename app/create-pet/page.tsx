"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { PetForm } from "@/components/pet-form";
import { createPet } from "@/lib/actions/pets";

export default function CreatePetPage() {
  const router = useRouter();
  const t = useTranslations("createPet");
  const tForm = useTranslations("petForm");

  const handleSubmit = async (formData: FormData) => {
    await createPet(formData);
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-clay blueprint-grid">
      <header className="fixed top-0 left-0 right-0 z-50 glass shadow-ambient">
        <div className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4 w-full max-w-3xl mx-auto">
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/"
              className="p-2 hover:bg-secondary-fixed/20 rounded-full transition-colors spring-active"
            >
              <Icon
                name="arrow_back"
                className="text-primary text-xl md:text-2xl"
              />
            </Link>
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
          </div>
        </div>
      </header>

      <main className="pt-20 md:pt-28 pb-16 px-4 md:px-6 max-w-3xl mx-auto">
        <div className="mb-8 md:mb-12 relative animate-fade-up">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-[800] text-primary font-headline italic tracking-tighter mb-3 md:mb-4 leading-[1.05]">
            {t("title")} <br />
            <span className="text-on-surface-variant">{t("titleAccent")}</span>
          </h2>
          <p className="text-base md:text-lg text-on-surface-variant max-w-md font-body">
            {t("subtitle")}
          </p>
          <div className="absolute -right-4 top-0 hidden md:block">
            <div className="w-28 h-28 lg:w-32 lg:h-32 border-2 border-dashed border-tertiary/20 rounded-full flex items-center justify-center animate-pulse-soft">
              <Icon
                name="architecture"
                filled
                className="text-tertiary text-3xl lg:text-4xl"
              />
            </div>
          </div>
        </div>

        <PetForm
          onSubmit={handleSubmit}
          submitLabel={tForm("createProfile")}
          submittingLabel={tForm("creating")}
        />
      </main>
    </div>
  );
}
