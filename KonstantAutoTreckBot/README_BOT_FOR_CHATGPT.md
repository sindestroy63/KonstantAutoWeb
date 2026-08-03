# KonstantAutoTreckBot — Technical Audit

## 1. Summary

`KonstantAutoTreckBot` is a real Telegram bot project. It is not a Node.js project and no `package.json` was found in the audited folder.

The bot is written in Python and uses `aiogram` 3.x. It runs as a long-lived polling process, handles user/admin Telegram interactions, stores local state in SQLite databases, reads/writes order data in Google Sheets, and sends Telegram messages through the `aiogram.Bot` client.

No HTTP server/API endpoint was found in the audited files. In its current form, this project cannot receive website leads over HTTP as an NL proxy without adding a small web/API layer.

No secrets, token values, chat IDs, database contents, or credential JSON contents are included in this report.

## 2. Stack

Observed stack:

- Language: Python.
- Telegram framework: `aiogram==3.*`.
- Env loading: `python-dotenv==1.*`.
- Google Sheets integration: `gspread==6.*`, `google-auth==2.*`.
- Local storage: SQLite via Python standard library `sqlite3`.

Dependency file:

- `requirements.txt`

No Node.js project files were found:

- No `package.json` was found.
- No npm/yarn/pnpm lockfile was found in the audited top-level file list.

## 3. How it runs

Likely local setup/run, inferred from Python files and `requirements.txt`:

```bash
python -m venv .venv
pip install -r requirements.txt
python main.py
```

Do not run the bot during audit unless explicitly approved, because it can connect to Telegram, Google Sheets, and local databases.

Runtime requirements:

- Valid Telegram bot token in environment.
- Google service account credentials JSON available at the configured path.
- Google Sheet ID configured in environment.
- SQLite DB files available or creatable in the working directory.

## 4. Entrypoint

Main entrypoint:

- `main.py`

Important flow in `main.py`:

1. Imports `Bot` and `Dispatcher` from `aiogram`.
2. Creates `Bot(BOT_TOKEN)`.
3. Creates `Dispatcher()`.
4. Includes routers from:
   - `handlers/admin.py`
   - `handlers/user.py`
5. Calls `bot.delete_webhook(drop_pending_updates=True)`.
6. Starts background status watcher via `asyncio.create_task(status_watcher(...))`.
7. Starts Telegram polling with `dp.start_polling(bot)`.

## 5. Polling vs webhook

The bot uses polling.

Evidence:

- `main.py` explicitly removes webhook before startup:

```python
await bot.delete_webhook(drop_pending_updates=True)
```

- `main.py` starts polling:

```python
await dp.start_polling(bot)
```

No active webhook server implementation was found.

## 6. HTTP server/API

No HTTP server/API layer was found in the audited source files.

Search did not find usage of common Python web/API frameworks or server libraries such as:

- FastAPI
- Flask
- aiohttp
- uvicorn
- `http.server`

Current inbound interface is Telegram updates received by polling, not HTTP requests from the website.

Implication:

- The project cannot currently act as `RF site -> NL bot/proxy -> Telegram API` by itself.
- It can be adapted, but a dedicated HTTP endpoint must be added or a separate lightweight proxy service should be created next to it.

## 7. Environment variables

Environment variables are loaded in:

- `config.py`

Observed env variable names:

- `BOT_TOKEN` — Telegram bot token for `aiogram.Bot`.
- `GOOGLE_CREDS_JSON` — path to Google service account JSON; default is `google-creds.json`.
- `SHEET_ID` — Google Sheets document ID.
- `ADMIN_CHAT_ID` — Telegram chat/user ID used for admin lead notifications.
- `ADMIN_ID` — comma-separated list of Telegram user IDs with admin access.
- `STATUS_POLL_SECONDS` — interval for background status polling; default is `60`.

Files that may contain secrets and must not be printed or committed:

- `.env`
- `google-creds.json`
- `bot.db`
- `users.db`

## 8. Telegram usage

Telegram library/API usage is present through `aiogram`.

Primary bot creation:

- `main.py` creates `Bot(BOT_TOKEN)`.

Message sending locations:

- `handlers/user.py`
  - Sends consultation requests to `ADMIN_CHAT_ID` via `message.bot.send_message(...)`.
  - Sends car selection requests to `ADMIN_CHAT_ID` via `message.bot.send_message(...)`.
  - Sends normal bot replies via `message.answer(...)`.
- `handlers/admin.py`
  - Sends admin broadcasts to collected users via `message.bot.send_message(...)`.
  - Sends client status notifications via `callback.bot.send_message(...)`.
- `watcher.py`
  - Sends background status update notifications via `bot.send_message(...)`.

No direct hardcoded `https://api.telegram.org` URL was found in audited Python files. Telegram API calls are abstracted through `aiogram`.

## 9. Main project files

- `main.py` — process entrypoint, dispatcher/router setup, polling startup, background watcher startup.
- `config.py` — environment variable loading and admin checks.
- `handlers/user.py` — user-facing bot flows: start, selection request, consultation, contacts, VIN tracking.
- `handlers/admin.py` — admin panel, broadcasts, client list/status management.
- `watcher.py` — background status watcher that polls Google Sheets-derived status data and pushes Telegram updates.
- `sheets.py` — Google Sheets integration for orders/statuses.
- `db.py` — SQLite persistence for users and VIN tracking links.
- `keyboards.py` — Telegram reply/inline keyboard definitions.
- `states.py` — aiogram FSM states for pickup, consultation, broadcast, tracking.
- `requirements.txt` — Python dependencies.

## 10. Current behavior

The bot supports these main scenarios:

1. User opens bot with `/start`.
2. User can submit a car selection request inside Telegram.
3. User can request consultation inside Telegram.
4. User can track a car by VIN.
5. Admin can view users count and send broadcasts.
6. Admin can inspect client/order rows from Google Sheets and update statuses.
7. Background watcher checks tracked VIN statuses and sends push updates when status changes.

Lead/request delivery inside this bot:

- Telegram-originated selection/consultation forms are formatted in `handlers/user.py`.
- Resulting messages are sent to `ADMIN_CHAT_ID` through the same bot.
- There is no visible website HTTP lead receiver.

## 11. Can it be used as NL proxy?

Current answer: not directly.

Why:

- It has Telegram credentials and can send Telegram messages through aiogram.
- It has no HTTP server/API endpoint to receive leads from the production website.
- It is built around Telegram polling and FSM handlers, not server-to-server lead ingestion.
- Running it as-is on the NL server would not let the RF website submit `/api/leads` payloads unless a new API layer is added.

Possible reuse options:

1. Reuse this project as the NL host process and add a small authenticated HTTP API.
2. Create a separate minimal NL proxy service and leave this bot unchanged.
3. Share only formatting/sending concepts, but keep website lead proxy independent from the tracking bot.

Safest recommendation:

- Prefer a small dedicated NL proxy service unless the team explicitly wants this bot to own website lead delivery too.
- If reusing this bot, keep the Telegram polling bot and HTTP proxy concerns clearly separated.

## 12. Minimal plan: RF site → NL bot/proxy → Telegram API

Goal: avoid direct Telegram Bot API calls from the Russian production website.

Recommended minimal architecture:

1. Keep KonstantAutoWeb frontend unchanged:
   - Browser continues submitting leads to `POST /api/leads` on the RF website.
2. Change only the RF website server delivery adapter:
   - `app/api/leads/route.ts` validates and formats lead as it does now.
   - Instead of calling `https://api.telegram.org/...`, it sends an HTTPS POST to the NL proxy.
3. Add NL proxy endpoint:
   - Example endpoint: `POST /api/site-leads`.
   - Require server-to-server auth, e.g. `Authorization: Bearer <secret>` or HMAC signature.
   - Accept preformatted message text or structured lead payload.
4. NL proxy sends Telegram message:
   - Use Telegram bot token stored only on the NL server.
   - Send to configured admin/work chat.
   - Return normalized JSON success/error to RF website.
5. Add safety features:
   - Request timeout from RF site to NL proxy.
   - Generic user-facing errors.
   - Server-side logging without secrets.
   - Optional idempotency key to prevent duplicate lead messages.

If implemented inside `KonstantAutoTreckBot`, likely new pieces would be needed:

- A web framework dependency such as FastAPI/aiohttp/Flask.
- A separate HTTP app module, not mixed into Telegram handlers.
- Env variables for proxy auth and target chat.
- Deployment process that can run both polling bot and HTTP server reliably, or split them into two processes.

## 13. Open questions

1. Where is this bot currently deployed: Russia, Netherlands, or elsewhere?
2. Is this bot the same public bot linked from KonstantAutoWeb (`KONSTANTAutobot`)?
3. Should website leads go to `ADMIN_CHAT_ID` or a separate work chat?
4. Should the NL proxy receive formatted text from the website or structured JSON and format messages itself?
5. Should the tracking bot and website lead proxy be one deployment or separate services?
6. What authentication standard should be used between RF website and NL proxy?
7. Is persistence/retry required if Telegram API or NL proxy is temporarily unavailable?
8. Should Google Sheets receive website leads too, or only Telegram notifications?
