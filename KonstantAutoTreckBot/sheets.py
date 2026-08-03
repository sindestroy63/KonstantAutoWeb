import re
from typing import Dict, Tuple, List, Any, Optional

import gspread
from google.oauth2.service_account import Credentials

from config import GOOGLE_CREDS_JSON, SHEET_ID


# Для возможности админских правок статусов требуется доступ на запись
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

creds = Credentials.from_service_account_file(
    GOOGLE_CREDS_JSON,
    scopes=SCOPES,
)

gc = gspread.authorize(creds)
sh = gc.open_by_key(SHEET_ID)


# =======================
# VIN
# =======================

VIN_PATTERN = re.compile(r"^[A-HJ-NPR-Z0-9]{17}$")


def normalize_vin(raw: str | None) -> str | None:
    """
    Нормализует и валидирует VIN:
    - 17 символов
    - латинские буквы и цифры
    - без I, O, Q
    """
    if not raw:
        return None
    vin = str(raw).strip().upper()
    if not VIN_PATTERN.match(vin):
        return None
    return vin


def load_statuses() -> List[dict]:
    ws = sh.worksheet("statuses")
    rows = ws.get_all_records()
    rows.sort(key=lambda r: int(r.get("step_order", 0) or 0))
    return rows


def get_status_title(status_code: Any, statuses: List[dict]) -> str:
    """
    Возвращает человеко-читаемое название статуса по его коду.
    status_code может быть строкой или числом из ячейки.
    """
    code_str = _safe_str(status_code)
    if not code_str:
        return "—"

    for s in statuses:
        if _safe_str(s.get("status_code")) == code_str:
            title = _safe_str(s.get("status_title"))
            return title or code_str

    return code_str


# Колонки листа orders (точно как в таблице):
# car, vin, client_name, order_id, status, status_updated_at, comment


def _safe_str(val: Any, default: str = "") -> str:
    """
    Безопасное приведение к строке для значений из ячеек.
    Поддерживает: str, int, None, пустую строку.
    """
    if val is None:
        return default
    s = str(val).strip()
    return s if s else default


def get_all_orders() -> List[dict]:
    """
    Загружает все заявки из листа orders для админ-панели.
    Возвращает только строки с валидным VIN (чтобы можно было открыть карточку по VIN).
    """
    ws = sh.worksheet("orders")
    rows = ws.get_all_records()
    result = []
    for r in rows:
        raw_vin = r.get("vin") or r.get("VIN")
        vin = normalize_vin(raw_vin)
        if vin:
            row = dict(r)
            row["_vin"] = vin
            result.append(row)
    return result


def get_order_display_label(order: dict) -> str:
    """
    Подпись для кнопки списка клиентов. order_id в UI не показываем.
    Приоритет:
    1) client_name — car
    2) если нет client_name: car
    3) если нет car: client_name
    4) если оба пусты: VIN
    """
    client_name = _safe_str(order.get("client_name"))
    car = _safe_str(order.get("car"))
    vin = order.get("_vin") or _safe_str(order.get("vin") or order.get("VIN"))

    if client_name and car:
        return f"{client_name} — {car}"
    if not client_name and car:
        return car
    if client_name and not car:
        return client_name
    return vin or "—"


def find_order_by_vin(vin: str) -> dict | None:
    """Поиск заявки по VIN в листе orders."""
    ws = sh.worksheet("orders")
    rows = ws.get_all_records()

    vin_norm = normalize_vin(vin)
    if not vin_norm:
        return None

    for r in rows:
        sheet_vin = normalize_vin(r.get("vin") or r.get("VIN"))
        if sheet_vin and sheet_vin == vin_norm:
            return r

    return None


def build_status_map_by_vin() -> Dict[str, Tuple[str, str, str, str]]:
    """
    Читает таблицу заказов и формирует карту:
    vin -> (status, car, updated, comment)
    Значения из ячеек могут быть str, int, None — обрабатываются через _safe_str.
    """
    ws = sh.worksheet("orders")
    rows = ws.get_all_records()

    sheet_map: Dict[str, Tuple[str, str, str, str]] = {}
    for r in rows:
        vin = normalize_vin(r.get("vin") or r.get("VIN"))
        if not vin:
            continue
        status = _safe_str(r.get("status"))
        car = _safe_str(r.get("car"))
        updated = _safe_str(r.get("status_updated_at") or r.get("updated"))
        comment = _safe_str(r.get("comment"))

        if status:
            sheet_map[vin] = (status, car, updated, comment)

    return sheet_map


def update_order_status(
    vin: str,
    new_status_code: str,
    *,
    set_updated_at: bool = True,
    updated_at_value: Optional[str] = None,
) -> None:
    """
    Обновляет статус заявки по VIN в листе orders.
    Предполагается, что:
    - VIN хранится в колонке VIN или vin
    - статус в колонке status
    - дата обновления в колонке status_updated_at (если есть)
    """
    ws = sh.worksheet("orders")
    rows = ws.get_all_records()

    vin_norm = normalize_vin(vin)
    if not vin_norm:
        return

    # Определяем индексы нужных колонок по заголовку
    header_row = ws.row_values(1)
    col_map = {name: idx + 1 for idx, name in enumerate(header_row)}

    status_col = col_map.get("status")
    updated_col = col_map.get("status_updated_at") or col_map.get("updated")

    for i, r in enumerate(rows):
        sheet_vin = normalize_vin(r.get("vin") or r.get("VIN"))
        if not sheet_vin or sheet_vin != vin_norm:
            continue

        # В get_all_records() первая запись соответствует второй строке в таблице
        row_index = i + 2

        updates: list[tuple[int, str]] = []

        if status_col is not None:
            updates.append((status_col, new_status_code))

        if set_updated_at and updated_col is not None:
            from datetime import datetime

            value = updated_at_value or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            updates.append((updated_col, value))

        if not updates:
            return

        # Минимальный батч-апдейт по ячейкам
        for col, value in updates:
            ws.update_cell(row_index, col, value)

        return


def format_progress(current_status: Any, statuses: List[dict]) -> str:
    """current_status может быть строкой или числом из ячейки."""
    code_key = _safe_str(current_status)
    index_map = {_safe_str(s.get("status_code")): i for i, s in enumerate(statuses)}
    current_index = index_map.get(code_key, -1)

    lines: List[str] = []

    for i, s in enumerate(statuses):
        title = _safe_str(s.get("status_title")) or _safe_str(s.get("status_code"))

        if current_index == -1:
            mark = "⬜"
        else:
            if i < current_index:
                mark = "✅"
            elif i == current_index:
                mark = "🟡"
            else:
                mark = "⬜"

        lines.append(f"{mark} {title}")

    return "\n".join(lines)

