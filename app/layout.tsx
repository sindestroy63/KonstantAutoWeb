import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeaderV2 } from "@/components/site-v2/HeaderV2";
import { FooterV2 } from "@/components/site-v2/FooterV2";
import { LeadModalProvider } from "@/components/leads/LeadModalProvider";
import { JsonLd } from "@/components/JsonLd";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { organizationJsonLd, websiteJsonLd } from "@/lib/structured-data";
import { USE_UI_V2 } from "@/lib/ui-version";
import { getProductionAiImage } from "@/lib/production-ai-images";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const defaultShareImage = getProductionAiImage("lexus_rx");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KONSTANT AUTO — Привоз авто из-за рубежа под ключ | Самара",
    template: "%s | KONSTANT AUTO",
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: SITE_NAME,
    title: "KONSTANT AUTO — Привоз авто из-за рубежа под ключ",
    description: SITE_DESCRIPTION,
    images: defaultShareImage ? [{
      url: defaultShareImage.src,
      width: 1600,
      height: 1000,
      alt: "KONSTANT AUTO — автомобили из-за рубежа под ключ",
    }] : [],
  },
  twitter: {
    card: "summary_large_image",
    title: "KONSTANT AUTO — Привоз авто из-за рубежа под ключ",
    description: SITE_DESCRIPTION,
    images: defaultShareImage ? [defaultShareImage.src] : [],
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
        <JsonLd data={[organizationJsonLd, websiteJsonLd]} />
        <LeadModalProvider>
          <div className="relative flex min-h-screen flex-col">
            {USE_UI_V2 ? <HeaderV2 /> : <Header />}
            <main className="flex-1">{children}</main>
            {USE_UI_V2 ? <FooterV2 /> : <Footer />}
          </div>
        </LeadModalProvider>
      </body>
    </html>
  );
}
