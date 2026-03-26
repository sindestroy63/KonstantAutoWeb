import { NextResponse } from "next/server";
import {
  formatConsultationLeadMessage,
  formatSelectionLeadMessage,
  validateConsultationPayload,
  validateSelectionPayload,
  type ConsultationPayload,
  type SelectionPayload,
} from "@/lib/leads";

type LeadRequestBody =
  | { kind: "selection"; data: SelectionPayload }
  | { kind: "consultation"; data: ConsultationPayload };

function getTelegramConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return null;
  }

  return { token, chatId };
}

export async function POST(request: Request) {
  const telegram = getTelegramConfig();

  if (!telegram) {
    return NextResponse.json(
      { error: "Не настроена отправка в Telegram. Проверьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID." },
      { status: 500 }
    );
  }

  let body: LeadRequestBody;

  try {
    body = (await request.json()) as LeadRequestBody;
  } catch {
    return NextResponse.json({ error: "Некорректный формат запроса." }, { status: 400 });
  }

  if (!body || !("kind" in body) || !("data" in body)) {
    return NextResponse.json({ error: "Не хватает данных заявки." }, { status: 400 });
  }

  const message =
    body.kind === "selection"
      ? (() => {
          const errors = validateSelectionPayload(body.data);
          if (Object.keys(errors).length > 0) {
            return null;
          }
          return formatSelectionLeadMessage(body.data);
        })()
      : (() => {
          const errors = validateConsultationPayload(body.data);
          if (Object.keys(errors).length > 0) {
            return null;
          }
          return formatConsultationLeadMessage(body.data);
        })();

  if (!message) {
    return NextResponse.json({ error: "Проверьте обязательные поля формы." }, { status: 400 });
  }

  const telegramResponse = await fetch(`https://api.telegram.org/bot${telegram.token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: telegram.chatId,
      text: message,
      disable_web_page_preview: true,
    }),
    cache: "no-store",
  });

  if (!telegramResponse.ok) {
    const errorText = await telegramResponse.text().catch(() => "");
    return NextResponse.json(
      {
        error: "Telegram не принял сообщение. Проверьте токен бота, chat id и права бота в группе.",
        details: errorText || undefined,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
