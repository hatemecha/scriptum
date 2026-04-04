import { appEnvironment } from "@/config/env";

type SiteConfig = {
  description: string;
  name: string;
  url: string;
};

export const siteConfig: SiteConfig = {
  name: appEnvironment.public.appName,
  url: appEnvironment.public.appUrl,
  description:
    "Minimal screenplay writing software focused on speed, clarity, and professional formatting.",
};
