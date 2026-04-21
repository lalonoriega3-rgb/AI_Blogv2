// src/app/layout.jsx
import { Instrument_Serif, Syne, JetBrains_Mono } from "next/font/google";
import Navbar from "./components/Navbar";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: {
    default: "AIToolsHub — Herramientas de IA en español",
    template: "%s | AIToolsHub",
  },
  description:
    "Las últimas noticias, guías y análisis sobre herramientas de inteligencia artificial en español.",
  metadataBase: new URL(process.env.BLOG_URL || "https://localhost:3000"),
  openGraph: {
    siteName: "AIToolsHub",
    locale: "es_MX",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${instrumentSerif.variable} ${syne.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
