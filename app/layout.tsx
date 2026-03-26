import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { GlobalRouteBackground } from "@/components/ui/GlobalRouteBackground";
import { LeadModalProvider } from "@/components/leads/LeadModalProvider";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://konstant-auto.ru"),
  title: {
    default: "KONSTANT AUTO — Привоз авто из-за рубежа под ключ | Самара",
    template: "%s | KONSTANT AUTO",
  },
  description:
    "KONSTANT AUTO — подбор и привоз автомобилей из Китая, Кореи, Японии, США, Европы и ОАЭ. Доставка в РФ и Беларусь. Договор, прозрачный расчёт, фото/видео отчёты. Самара.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/icon.png", type: "image/png" },
      { url: "/brand/sign-black.png", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={manrope.variable}>
      <body className="min-h-screen font-sans text-slate-900">
        <ScrollProgressBar />
        <GlobalRouteBackground />
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
          <div className="floating-orb absolute left-[-12rem] top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,82,82,0.12),transparent_68%)] blur-3xl" />
          <div className="floating-orb-slow absolute right-[-8rem] top-[-4rem] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(69,112,255,0.08),transparent_72%)] blur-3xl" />
          <div className="floating-orb absolute bottom-[-10rem] left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,56,56,0.09),transparent_70%)] blur-3xl" />
        </div>
        <LeadModalProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </LeadModalProvider>
      </body>
    </html>
  );
}
