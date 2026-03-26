import type { Metadata } from "next";
import { ContactsContent } from "./ContactsContent";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Связь с KONSTANT AUTO: Telegram-бот, канал, телефон +7 927 719 8887, VK, MAX. Самара.",
  openGraph: {
    title: "Контакты | KONSTANT AUTO",
  },
};

export default function ContactsPage() {
  return <ContactsContent />;
}
