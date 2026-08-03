from aiogram.fsm.state import State, StatesGroup


class PickupForm(StatesGroup):
    brand_model = State()
    car_class = State()
    year = State()
    transmission = State()
    drive = State()
    budget = State()
    timing = State()
    name_city = State()
    phone = State()


class ConsultForm(StatesGroup):
    datetime = State()
    fio = State()
    phone = State()
    topic = State()
    goal = State()
    other_text = State()


class BroadcastForm(StatesGroup):
    text = State()


class TrackForm(StatesGroup):
    vin = State()

