import type { Metadata } from "next";
import { ContactsContent } from "./ContactsContent";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Связь с KONSTANT AUTO: Telegram-бот, канал, телефон +7 927 719 8887, VK, MAX. Самара.",
  alternates: { canonical: "/contacts" },
  openGraph: {
    title: "Контакты | KONSTANT AUTO",
    url: "/contacts",
  },
};

export default function ContactsPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Главная", path: "/" },
          { name: "Контакты", path: "/contacts" },
        ])}
      />
      <ContactsContent />
    </>
  );
}
