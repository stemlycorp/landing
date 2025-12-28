export const locales = ["en", "ko"] as const;

export type Locale = (typeof locales)[number];

export const normalizePath = (path: string) => {
  if (!path) return "/";
  const prefixed = path.startsWith("/") ? path : `/${path}`;
  return prefixed.replace(/\/{2,}/g, "/");
};

export const prefixForLang = (lang: Locale) => (lang === "ko" ? "/ko" : "/en");

export const hrefForLang = (lang: Locale, path: string) =>
  normalizePath(`${prefixForLang(lang)}${path.startsWith("/") ? path : `/${path}`}`);

export const otherLocale = (lang: Locale): Locale => (lang === "ko" ? "en" : "ko");
