import { NextResponse } from "next/server";
import {
  formatConsultationLeadMessage,
  formatSelectionLeadMessage,
  parseLeadRequestBody,
  validateConsultationPayload,
  validateSelectionPayload,
} from "@/lib/leads";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 16_384;
const PROXY_TIMEOUT_MS = 8_000;

async function readBodyWithLimit(request: Request): Promise<string | null> {
  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let totalBytes = 0;
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    result += decoder.decode(value, { stream: true });
  }

  return result + decoder.decode();
}

function getLeadsProxyConfig() {
  const url = process.env.LEADS_PROXY_URL;
  const secret = process.env.LEADS_PROXY_SECRET;

  if (!url || !secret) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") return null;
    return { url: parsedUrl.toString(), secret };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return NextResponse.json({ error: "Ожидается JSON-запрос." }, { status: 415 });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Запрос слишком большой." }, { status: 413 });
  }

  let rawBody: string;

  try {
    const limitedBody = await readBodyWithLimit(request);
    if (limitedBody === null) {
      return NextResponse.json({ error: "Запрос слишком большой." }, { status: 413 });
    }
    rawBody = limitedBody;
  } catch {
    return NextResponse.json({ error: "Некорректный формат запроса." }, { status: 400 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ error: "Некорректный формат запроса." }, { status: 400 });
  }

  const body = parseLeadRequestBody(parsedBody);
  if (!body) {
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

  const proxy = getLeadsProxyConfig();
  if (!proxy) {
    return NextResponse.json(
      { error: "Не настроена отправка заявок. Проверьте LEADS_PROXY_URL и LEADS_PROXY_SECRET." },
      { status: 503 }
    );
  }

  let proxyResponse: Response;

  try {
    proxyResponse = await fetch(proxy.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${proxy.secret}`,
      },
      body: JSON.stringify({ text: message }),
      cache: "no-store",
      signal: AbortSignal.timeout(PROXY_TIMEOUT_MS),
    });
  } catch {
    return NextResponse.json(
      { error: "Сервис доставки заявок временно недоступен. Попробуйте ещё раз позже." },
      { status: 502 }
    );
  }

  if (!proxyResponse.ok) {
    return NextResponse.json(
      {
        error: "Не удалось доставить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
