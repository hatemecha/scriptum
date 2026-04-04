type SiteConfig = {
  description: string;
  name: string;
  url: string;
};

const FALLBACK_SITE_NAME = "Scriptum";
const FALLBACK_SITE_URL = "http://localhost:3000";

function getSiteName(): string {
  const siteName = process.env.NEXT_PUBLIC_APP_NAME?.trim();

  return siteName && siteName.length > 0 ? siteName : FALLBACK_SITE_NAME;
}

function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!siteUrl) {
    return FALLBACK_SITE_URL;
  }

  try {
    return new URL(siteUrl).toString().replace(/\/$/, "");
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const siteConfig: SiteConfig = {
  name: getSiteName(),
  url: getSiteUrl(),
  description:
    "Minimal screenplay writing software focused on speed, clarity, and professional formatting.",
};
