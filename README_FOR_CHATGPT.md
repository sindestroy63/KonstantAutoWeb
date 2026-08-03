# KonstantAutoWeb — Technical Audit

## 1. Project overview

KonstantAutoWeb is a production Next.js website for KONSTANT AUTO, a Samara-based company focused on importing cars to order. The site acts as a marketing landing page, catalog, contact point, and lead capture interface.

The current lead/request flow is implemented inside this website. Users submit requests through on-site modal forms; the website server-side API route formats the request and sends it to a Telegram chat.

Important context for the next developer/ChatGPT:

- Production is hosted on a server in Russia.
- Direct requests from a Russian server to Telegram Bot API may fail due to network restrictions.
- Target architecture after this audit: KonstantAutoWeb should send lead payloads to a proxy/API on a Netherlands server; the NL server should call Telegram Bot API.
- This audit is read-only except for creating this documentation file.
- No secrets, tokens, chat IDs, or environment file contents are included here.

## 2. Stack and runtime

Observed stack:

- Framework: Next.js 14.2.18 with App Router.
- UI/runtime: React 18.3.1, React DOM 18.3.1.
- Language: TypeScript 5.
- Styling: TailwindCSS 3.4.15, PostCSS, Autoprefixer.
- Icons: lucide-react.
- Package manager: npm, confirmed by `package-lock.json` and scripts in `package.json`.
- Node version: not explicitly pinned in the repository. No `.nvmrc`, `engines.node`, or similar runtime pin was visible from the audited files.

Relevant files:

- `package.json` — scripts and dependencies.
- `package-lock.json` — npm lockfile.
- `next.config.js` — Next.js image remote patterns.
- `tsconfig.json` — strict TypeScript config with `@/*` path alias.
- `tailwind.config.ts`, `postcss.config.js`, `.eslintrc.json` — styling/lint tooling.

## 3. Local launch

Commands from the existing project README and `package.json`:

```bash
npm install
npm run dev
```

Open local site:

```text
http://localhost:3000
```

Production build/run:

```bash
npm run build
npm start
```

Default Next.js port is 3000 unless overridden externally.

For lead sending to work locally, the server runtime needs Telegram-related environment variables configured. Do not commit or expose secret values.

## 4. Important folders/files

Core app structure:

- `app/layout.tsx` — global layout, wraps pages with `LeadModalProvider`.
- `app/page.tsx` — home page.
- `app/catalog/page.tsx` — catalog page.
- `app/catalog/[slug]/page.tsx` — catalog item/detail page.
- `app/contacts/page.tsx` and `app/contacts/ContactsContent.tsx` — contacts page with lead CTAs and Telegram bot links.
- `app/tracking/page.tsx` — Telegram tracking page.
- `app/privacy/page.tsx` — privacy policy.
- `app/api/leads/route.ts` — server API route that currently sends leads to Telegram.

Lead-related files:

- `components/leads/LeadModalProvider.tsx` — React context for opening/closing the lead modal globally.
- `components/leads/LeadModalTrigger.tsx` — reusable button wrapper that opens the lead modal.
- `components/leads/LeadModal.tsx` — client-side modal UI, form state, validation calls, and `fetch("/api/leads")` submission.
- `components/leads/ContactFields.tsx` — shared contact fields for lead forms.
- `lib/leads.ts` — lead payload types, validation, defaults, formatting of Telegram messages.
- `lib/constants.ts` — public links to Telegram bot/channel and other contacts.

Other frequently involved CTA locations:

- `components/Header.tsx` — header CTA opens lead modal.
- `components/Footer.tsx` — footer CTAs open lead modal and link to Telegram bot/channel.
- `components/CarCard.tsx` — catalog card CTA opens lead modal with selection mode.
- `components/home/HeroSection.tsx` — home page lead CTAs.
- `components/home/HeroCarCarousel.tsx` — hero carousel lead CTA.
- `components/home/CtaSection.tsx` — home CTA section for lead/consultation and Telegram bot.
- `app/catalog/[slug]/page.tsx` — detail page CTA opens lead modal with likely prefill.

## 5. Lead/request flow

Current flow:

1. User clicks a `LeadModalTrigger` button in header, footer, home page, catalog, contacts, or car detail page.
2. `LeadModalTrigger` calls `openLeadModal(mode, prefill?)` from `LeadModalProvider`.
3. `LeadModalProvider` renders `LeadModal` globally from `app/layout.tsx`.
4. `LeadModal` supports two lead modes:
   - `selection` — multi-step car selection request.
   - `consultation` — shorter consultation request.
5. Client-side form validation uses functions from `lib/leads.ts`.
6. On submit, `LeadModal.submitLead()` sends:

```ts
fetch("/api/leads", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ kind, data }),
})
```

7. `app/api/leads/route.ts` parses request JSON and validates payload again server-side.
8. `app/api/leads/route.ts` formats the message through `formatSelectionLeadMessage()` or `formatConsultationLeadMessage()` from `lib/leads.ts`.
9. `app/api/leads/route.ts` sends the formatted text directly to Telegram Bot API.
10. On success, the client shows a success state and offers a link to the public Telegram bot.

Payload shapes are defined in `lib/leads.ts`:

- `SelectionPayload`: name, phone, contact method, Telegram username, budget, car type, model, condition, transmission, drive, timeline, comment.
- `ConsultationPayload`: name, phone, contact method, Telegram username, topic, question.

## 6. Telegram integration

There are two separate Telegram-related concepts in the site:

1. Public Telegram bot/channel links for users.
2. Server-side Telegram Bot API call for delivering lead messages to an internal/work chat.

Public links:

- `lib/constants.ts` defines `BOT_URL`, `CHANNEL_URL`, `CHANNEL_DISPLAY`, and `BOT_START` deep links.
- The public bot URL points to `KONSTANTAutobot`.
- These links are used in contact, tracking, footer, CTA, and success states.

Server-side lead delivery:

- `app/api/leads/route.ts` reads `process.env.TELEGRAM_BOT_TOKEN` and `process.env.TELEGRAM_CHAT_ID`.
- It then calls Telegram Bot API directly:

```text
https://api.telegram.org/bot<token>/sendMessage
```

- Request body includes `chat_id`, `text`, and `disable_web_page_preview: true`.
- If Telegram returns non-OK, the route responds with HTTP 502 and an error message.

Answer to audit question: yes, there is a direct call to `api.telegram.org` in `app/api/leads/route.ts`.

## 7. Environment variables

Observed environment variables used for leads:

- `TELEGRAM_BOT_TOKEN` — Telegram bot token, used only server-side in `app/api/leads/route.ts`.
- `TELEGRAM_CHAT_ID` — target chat ID, used only server-side in `app/api/leads/route.ts`.

No `NEXT_PUBLIC_*` env variables were found during the targeted search.

No env example file was visible in the project root from the audited file list. `.gitignore` excludes `.env`, `.env.local`, and `.env.production`, which is correct for secrets.

Important security note:

- Do not expose the bot token to the client.
- Do not include real token/chat ID in documentation, logs, commits, screenshots, or frontend code.
- When introducing a proxy, use separate server-only env variables for the proxy endpoint and authentication secret.

Likely future env variables for proxy architecture:

- `LEADS_PROXY_URL` — HTTPS endpoint on the NL server.
- `LEADS_PROXY_SECRET` or equivalent — shared server-to-server authentication secret.
- Optional: `LEADS_PROXY_TIMEOUT_MS` — explicit timeout for proxy requests.

Exact names should be chosen during implementation and documented in deployment instructions.

## 8. Relation to konstant-auto-bot

The audited KonstantAutoWeb code does not import or call a local `konstant-auto-bot` project directly.

Observed relation:

- The website contains public links to the Telegram bot via `lib/constants.ts`.
- The website itself sends lead notifications to Telegram through `app/api/leads/route.ts`.
- From this repository alone, the separate `konstant-auto-bot` appears to be an external companion project, not an integrated dependency.

Current behavior in this site:

- Lead submission does not appear to call `konstant-auto-bot` as an API/service.
- Lead submission does not appear to enqueue data for bot processing.
- Lead submission formats a Telegram text message locally and posts it directly to Telegram Bot API.

Open item:

- Inspect the neighboring `konstant-auto-bot` repository separately to confirm whether it has an existing webhook/API that can be reused as the NL proxy or whether a new lightweight proxy service should be created.
- During this session, a nested folder was visible at `konstant-auto-bot/konstant-auto-bot` inside the current website workspace. Simple read-only listing commands did not reveal key source files such as `package.json`, `*.js`, `*.ts`, `.env.example`, or `README*` there. Treat the bot inspection as unresolved until the real bot repository path is confirmed and audited separately.

## 9. Current risks

Primary production risk:

- `app/api/leads/route.ts` depends on direct outbound HTTPS access from the Russian production server to `https://api.telegram.org`. If this network path is blocked, unstable, DNS-filtered, or rate-limited, lead sending fails even when the website itself is healthy.

User-visible failure mode:

- User submits a form.
- Client calls `/api/leads` successfully.
- Server fails when calling Telegram.
- API returns 502 with a Telegram-related message.
- Modal shows an error and the lead is not delivered to the working Telegram chat.

Other risks:

- No fallback delivery channel is visible in the audited code.
- No persistence/queue is visible; failed leads may be lost unless the user retries.
- Telegram error details are returned in API response. This may be useful for debugging but should be reviewed for production exposure.
- The UI copy says messages are sent directly to Telegram. After proxy implementation, this copy may become inaccurate.
- No timeout/AbortController is visible around the Telegram fetch; a slow network path can delay route response.
- No explicit rate limiting, anti-spam, CAPTCHA, or honeypot was observed in the lead endpoint.

Most likely breakage point:

- Direct server-side `fetch()` from `app/api/leads/route.ts` to `https://api.telegram.org/bot.../sendMessage`.

## 10. Recommended fix plan

Goal: keep the current frontend lead forms and validation intact, but change the server-side delivery adapter from direct Telegram API to a secure NL proxy/API.

Recommended safe architecture:

1. Keep client API contract unchanged:
   - Browser continues to call `POST /api/leads` with `{ kind, data }`.
   - No Telegram token or proxy secret is ever exposed client-side.
2. Keep validation and message formatting in KonstantAutoWeb initially:
   - Continue using `validateSelectionPayload`, `validateConsultationPayload`, `formatSelectionLeadMessage`, and `formatConsultationLeadMessage`.
   - This minimizes changes to business logic and form behavior.
3. Replace only the outbound delivery step in `app/api/leads/route.ts`:
   - Instead of calling Telegram Bot API directly, send a server-to-server POST to the NL proxy.
   - Payload can be either a preformatted message text or structured `{ kind, data, message }`.
4. Add proxy authentication:
   - Use an `Authorization: Bearer <server-secret>` header or HMAC signature.
   - Store secret only in server env on both sides.
5. Implement the NL proxy:
   - NL proxy receives authenticated lead delivery request.
   - NL proxy validates authentication and basic payload shape.
   - NL proxy sends `sendMessage` to Telegram Bot API from NL network.
   - NL proxy returns normalized success/error response to the website.
6. Add timeout and safer error handling:
   - Use `AbortController` on the website-to-proxy request.
   - Return generic user-facing errors; log diagnostic details server-side only.
7. Optional but recommended later:
   - Add retry/queue/persistence for failed leads.
   - Add idempotency key to avoid duplicate Telegram messages on retries.
   - Add rate limiting or basic anti-spam measures to `/api/leads`.

Compatibility recommendation:

- Do not change `LeadModal.tsx` unless the endpoint contract changes.
- Prefer changing only `app/api/leads/route.ts` and env/deployment config for the first safe proxy rollout.

## 11. Exact files likely needing changes

Most likely required changes for proxy implementation:

- `app/api/leads/route.ts`
  - Replace `getTelegramConfig()` with proxy config loading, e.g. `LEADS_PROXY_URL` and `LEADS_PROXY_SECRET`.
  - Replace direct `fetch("https://api.telegram.org/.../sendMessage")` with `fetch(LEADS_PROXY_URL, ...)`.
  - Keep server-side validation and message formatting unchanged unless the proxy is designed to receive raw structured leads.
  - Normalize proxy errors and avoid returning sensitive details to clients.

Likely documentation/config additions:

- `.env.example` or deployment README section, if the team wants one.
  - Should contain variable names only, never real values.
- Production server environment configuration.
  - Add proxy URL and secret.
  - Remove direct Telegram token/chat ID from the Russian site if the NL proxy fully owns Telegram delivery.
- NL proxy project/repository.
  - Could be the existing `konstant-auto-bot` if it already runs on NL infrastructure and can expose a secure API.
  - Otherwise create a small dedicated API service.

Possible copy update after implementation:

- `components/leads/LeadModal.tsx`
  - Current UI copy says: “Отправка идёт напрямую в рабочий Telegram-чат.”
  - After proxy rollout, this should be reworded to avoid claiming direct sending from the site.
  - This is content-only, not required for backend functionality.

Usually not necessary to change for first proxy rollout:

- `components/leads/LeadModalProvider.tsx`
- `components/leads/LeadModalTrigger.tsx`
- `components/leads/ContactFields.tsx`
- `lib/leads.ts`
- CTA files that only open the modal.

## 12. Open questions

1. Where is `konstant-auto-bot` hosted now: Russia, Netherlands, or another location?
2. Does `konstant-auto-bot` already expose an HTTP API/webhook for receiving website leads?
3. Should the NL proxy receive preformatted Telegram text from KonstantAutoWeb, or should it receive structured lead data and format messages itself?
4. Should Telegram bot token/chat ID live only on the NL server after migration?
5. What authentication scheme should be used between the Russian site and NL proxy: bearer token, HMAC signature, mTLS, or another method?
6. Are there production logging requirements for failed lead delivery?
7. Is lead persistence required so requests are not lost if Telegram or the proxy is temporarily unavailable?
8. Should the user-facing API response hide Telegram/proxy diagnostic details in production?
9. Is there a preferred timeout/retry policy for lead delivery?
10. Are there anti-spam requirements for `/api/leads` before exposing a proxy endpoint?