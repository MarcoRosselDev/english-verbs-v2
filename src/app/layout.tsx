import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { themeInitScript } from "@/lib/theme";

// Fuentes: cada una crea una variable CSS que usamos en globals.css
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Verb Conjugator",
  description: "Search English verbs with all their conjugations and Spanish translations.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: nuestro script agrega la clase "dark" a <html> antes de que
    // React cargue, así que el HTML del servidor y el del navegador difieren A PROPÓSITO.
    // Esta propiedad silencia el aviso solo en este elemento.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}