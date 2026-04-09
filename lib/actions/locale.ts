"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { locales, type Locale } from "@/i18n/config";

export async function setLocale(locale: string) {
  if (!locales.includes(locale as Locale)) return;

  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  // If authenticated and the user row exists, persist the preference. We
  // intentionally don't bootstrap the user here (that happens on the first
  // authenticated page/action via getSession) — locale changes on the public
  // signup page are cookie-only.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await prisma.user.updateMany({
      where: { id: user.id },
      data: { locale },
    });
  }

  revalidatePath("/", "layout");
}

export async function syncLocaleFromDb() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { locale: true },
  });
  if (!dbUser?.locale) return;

  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", dbUser.locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
