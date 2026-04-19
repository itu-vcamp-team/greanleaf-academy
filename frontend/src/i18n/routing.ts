import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tr", "en", "de", "fr", "ru", "es", "cn"],
  defaultLocale: "tr",
});
