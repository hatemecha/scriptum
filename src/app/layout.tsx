import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Courier_Prime, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { AppProviders } from "@/app/providers";
import { siteConfig } from "@/config/site";
import { DEFAULT_THEME_PREFERENCE, THEME_COOKIE_NAME, isThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

import "@/styles/globals.css";
import "@/features/editor/editor-blocks.css";

const uiFont = Manrope({
  preload: false,
  subsets: ["latin", "latin-ext"],
  variable: "--font-ui",
});

const scriptFont = Courier_Prime({
  preload: false,
  subsets: ["latin", "latin-ext"],
  variable: "--font-script",
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: {
      type: "image/svg+xml",
      url: "/favicon.svg",
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE_NAME)?.value;
  const initialTheme = isThemePreference(themeCookie) ? themeCookie : DEFAULT_THEME_PREFERENCE;

  return (
    <html
      lang="es"
      data-theme={initialTheme}
      className={cn(uiFont.variable, scriptFont.variable)}
    >
      <body className="app-body">
        <AppProviders initialTheme={initialTheme}>{children}</AppProviders>
      </body>
    </html>
  );
}
