import hashlib
from datetime import date

from aiogram.types import (
    ReplyKeyboardMarkup,
    KeyboardButton,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
)

from config import is_admin


def cars_in_transit_today(min_val: int = 50, max_val: int = 70) -> int:
    seed = f"{date.today().isoformat()}|konstant-auto"
    h = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    n = int(h[:8], 16)
    return min_val + (n % (max_val - min_val + 1))


def build_main_kb(user_id: int | None = None) -> ReplyKeyboardMarkup:
    cars = cars_in_transit_today(50, 70)
    keyboard = [
        [KeyboardButton(text="📝 Заявка на подбор"), KeyboardButton(text="☎️ Консультация")],
        [KeyboardButton(text="🚗 Отследить авто"), KeyboardButton(text=f"🚚 Машин в пути: {cars}")],
        [KeyboardButton(text="📞 Контакты")],
    ]

    if user_id is not None and is_admin(user_id):
        keyboard.append([KeyboardButton(text="🛠 Админка")])

    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)


kb_admin = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton(text="👤 Пользователи"), KeyboardButton(text="📢 Рассылка")],
        [KeyboardButton(text="🚗 Клиенты")],
        [KeyboardButton(text="⬅️ Назад")],
    ],
    resize_keyboard=True,
)


kb_contact = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton(text="📲 Отправить номер", request_contact=True)],
    ],
    resize_keyboard=True,
    one_time_keyboard=True,
)


def kb(rows):
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text=x) for x in row] for row in rows],
        resize_keyboard=True,
        one_time_keyboard=True,
    )


kb_cancel = kb([["✖️ Отменить"]])

kb_pick_class = kb(
    [
        ["🚗 Седан"],
        ["🚙 Кроссовер"],
        ["🛻 Внедорожник"],
        ["🚜 Пикап"],
        ["🚐 Минивэн"],
        ["💼 Бизнес-класс"],
        ["🚚 Коммерческие автомобили"],
        ["🔎 Другое"],
        ["✖️ Отменить"],
    ]
)

kb_pick_year = kb(
    [
        ["🆕 Новый"],
        ["⏳ От года до трёх лет"],
        ["⏳ От трёх до пяти лет"],
        ["⏳ Старше пяти лет"],
        ["✖️ Отменить"],
    ]
)

kb_pick_transmission = kb(
    [
        ["⚙️ АКПП"],
        ["⚙️ МКПП"],
        ["🤷‍♂️ Не принципиально"],
        ["✖️ Отменить"],
    ]
)

kb_pick_drive = kb(
    [
        ["🚗 Передний"],
        ["🚙 Задний"],
        ["🚘 Полный"],
        ["🤷‍♂️ Не принципиально"],
        ["✖️ Отменить"],
    ]
)

kb_pick_budget = kb(
    [
        ["💰 До 1 млн ₽"],
        ["💰 1–2 млн ₽"],
        ["💰 2–3 млн ₽"],
        ["💰 3+ млн ₽"],
        ["🤷‍♂️ Пока не знаю"],
        ["✖️ Отменить"],
    ]
)

kb_pick_timing = kb(
    [
        ["⏱ В течение месяца"],
        ["⏱ 1–2 месяца"],
        ["⏱ 2–3 месяца"],
        ["⏱ Не срочно"],
        ["✖️ Отменить"],
    ]
)

# Inline-клавиатура для раздела «Контакты»
contacts_keyboard = InlineKeyboardMarkup(
    inline_keyboard=[
        [InlineKeyboardButton(text="🌐 Наш сайт", url="https://константавто.рф")],
        [
            InlineKeyboardButton(text="📢 Telegram канал", url="https://t.me/+lRLbowo_GC4zYmRi"),
            InlineKeyboardButton(text="💬 Написать в Telegram", url="https://t.me/KONSTANTAutobot"),
        ],
        [
            InlineKeyboardButton(text="📘 VK", url="https://vk.com/konstantauto"),
            InlineKeyboardButton(text="⚡ MAX", url="https://max.ru/join/oTFAUZG9r0IART4x5z2A6R_neQqj7xy1GPfj42wnR0U"),
        ],
        [InlineKeyboardButton(text="⬅️ Назад", callback_data="contacts_back")],
    ]
)

kb_phone = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton(text="📲 Отправить номер", request_contact=True)],
        [KeyboardButton(text="✖️ Отменить")],
    ],
    resize_keyboard=True,
    one_time_keyboard=True,
)

