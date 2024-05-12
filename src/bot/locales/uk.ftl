# Commands

## my-status command
the-command-allowed-for-regular-users-only = Ця команда доступна тільки для звичайних користувачів.
shit-happens = Щось пішло не так. Звернись до адміна.
last-payment-was-for-period = Останній платіж було здійснено за період до {$date}
payments-not-found = Платежі не знайдені
not-payed-invoices = Несплачені рахунки
pagination-info-invoices =
    Сторінка {$page} з {$totalPages}. Нарахування {$numOfItemsOnPage} з {$totalItems}.
short-date-format = dd/LL/yy
sum-of-not-payed-invoices = Сума несплачених нарахувань: {$debtSum} грн
payment-rounded-to-1 = Всі нарахування округлені до 1 гривні
all-invoices-payed = Всі нарахування сплачені.

## invoice command
payments-for-subscription = Платежі за підписку
pagination-info-payments =
    Сторінка {$page} з {$totalPages}. Списання {$numOfItemsOnPage} з {$totalItems}.
short-datetime-format = dd/LL/yy, HH:mm

## details-for-payments command
details-for-payments = Реквізити для платежів
card-number-caption = 💳 Номер банківської карти:
bank-name = Monobank
payment-link-caption = 🔗 Якщо сума платежу більше ніж 100 грн, то можна скористатися посиланням:

## debtors command
debtors-title = Дебітори
command-only-admin = Ця команда доступна тільки для адміністраторів
no-debts = У всіх зареєстрованих підписників ({ $subscribersCount }) немає боргів
subscriber-debts-info = - { $sum } грн ({ $monthNumber } міс.)

## common
currency = грн

# Command descriptions
command-desc-invoices = Списання за підписку
command-desc-my-status = Мої платежі
command-desc-details-for-payments = Реквізити для платежів

# Menu

## debtPagination
pay-all-button = 💳 Сплатити все
payment-details-button = 💳 Реквізити для оплати

## common
previous-nav-button = ⬅️ Попередні
next-nav-button = Наступні ➡️
google-sheets-link = 👀 Платежі у Google таблиці

# Middlewares

## authenticatorMiddleware
no-user-information = Уявлення не маю хто ти. Якщо ти вважаєш, що це помилка, звернись до адміна.
error-occurred = Щось пішло не так. Звернись до адміна.
error-reported = Помилка:
authentication-complete = Автентифікацію пройдено. Ласкаво просимо!
status-restored = Ви відновили свій статус. З поверненням!

# Utils

pagination-tips = Для перегляду попередніх або наступних платежів використовуйте кнопки нижче