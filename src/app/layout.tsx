import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Courier_Prime, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { siteConfig } from "@/config/site";
import {
  DEFAULT_THEME_PREFERENCE,
  THEME_COOKIE_NAME,
  isThemePreference,
} from "@/lib/theme";

import "@/styles/globals.css";

const uiFont = Manrope({
  preload: false,
  subsets: ["latin"],
  variable: "--font-ui",
});

const scriptFont = Courier_Prime({
  preload: false,
  subsets: ["latin"],
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
    icon: [
      {
        type: "image/svg+xml",
        url: "/favicon.svg",
      },
      {
        sizes: "any",
        url: "/favicon.ico",
      },
    ],
    shortcut: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE_NAME)?.value;
  const initialTheme = isThemePreference(themeCookie)
    ? themeCookie
    : DEFAULT_THEME_PREFERENCE;

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      className={`${uiFont.variable} ${scriptFont.variable}`}
    >
      <body className="app-body">
        <ThemeProvider initialTheme={initialTheme}>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
