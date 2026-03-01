import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PHENIX | Plateforme Académique du Bénin",
  description: "La plateforme académique IA qui transforme l'éducation au Bénin.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0C3B2E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} font-display antialiased`}>
        <I18nProvider>
          {children}
        </I18nProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            className: "font-display",
            style: {
              borderRadius: "16px",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}

