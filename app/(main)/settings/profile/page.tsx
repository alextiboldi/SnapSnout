import { requireSession } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const [session, t] = await Promise.all([
    requireSession(),
    getTranslations("profile"),
  ]);

  return (
    <div className="animate-fade-up mx-auto max-w-lg px-5 pb-8">
      <h1 className="pt-2 font-headline text-2xl font-bold tracking-tight text-on-surface md:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-1 font-body text-sm text-on-surface-variant/70">
        {t("subtitle")}
      </p>

      <div className="mt-5">
        <ProfileForm
          name={session.user.name}
          email={session.user.email}
          avatarUrl={session.user.avatarUrl}
        />
      </div>
    </div>
  );
}
