"use server";

import { defaultLocale, Locale } from "@/config";
import { cookies } from "next/headers";

const COOKIE_NAME = "NEXT_LOCALE";

export async function getUserLocale() {
  const cookiesStore = await cookies();
  return cookiesStore.get(COOKIE_NAME)?.value || defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  const cookiesStore = await cookies();
  cookiesStore.set(COOKIE_NAME, locale);
}
