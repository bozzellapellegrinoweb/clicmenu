import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Clicmenu.ai — Menu Digitale per Ristoranti e Spa",
    template: "%s | Clicmenu.ai",
  },
  description:
    "Crea il tuo menu digitale in secondi. Scatta una foto al menu cartaceo e l'AI lo digitalizza automaticamente. €37/anno.",
  keywords: ["menu digitale", "ristorante", "spa", "QR code menu", "AI menu"],
  openGraph: {
    title: "Clicmenu.ai — Menu Digitale per Ristoranti e Spa",
    description: "Crea il tuo menu digitale in secondi con l'AI.",
    type: "website",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={`${plusJakarta.variable} h-full`}>
      <body className="min-h-full">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
