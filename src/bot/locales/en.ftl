# Commands

## my-status command
command-allowed-for-regular-users-only = This command is available for regular users only.
shit-happens = Something went wrong. Please contact the admin.
last-payment-was-for-period = The last payment was made for the period until {$date}
payments-not-found = Payments not found
not-payed-invoices = Unpaid invoices
pagination-info-invoices =
    Page {$page} of {$totalPages}. Invoices {$numOfItemsOnPage} of {$totalItems}.
short-date-format = dd/MM/yy
sum-of-not-payed-invoices = Total of unpaid invoices: {$debtSum} UAH
payment-rounded-to-1 = All payments are rounded to 1 UAH
all-invoices-payed = All invoices are paid.

## invoice command
payments-for-subscription = Payments for subscription
pagination-info-payments =
    Page {$page} of {$totalPages}. Payments {$numOfItemsOnPage} of {$totalItems}.
short-datetime-format = dd/MM/yy, HH

## details-for-payments command
details-for-payments = Payment details
card-number-caption = 💳 Bank card number:
bank-name = Monobank
payment-link-caption = 🔗 If the payment amount is more than 100 UAH, you can use the link:

## debtors command
debtors-title = Debtors
command-only-admin = This command is available for administrators only
no-debts = No debts among all registered subscribers ({$subscribersCount})
subscriber-debts-info = - {$sum} UAH ({$monthNumber} months)

## common
currency = UAH

# Command descriptions
command-desc-invoices = Payments for subscription
command-desc-my-status = My payments
command-desc-details-for-payments = Payment details

# Menu

## debtPagination
pay-all-button = 💳 Pay all
payment-details-button = 💳 Payment details

## common
previous-nav-button = ⬅️ Previous
next-nav-button = Next ➡️
google-sheets-link = 👀 Payments in Google Sheets

# Middlewares

## authenticatorMiddleware
no-user-information = I have no idea who you are. If you think this is an error, please contact the admin.
error-occurred = Something went wrong. Please contact the admin.
error-reported = Error:
authentication-complete = Authentication complete. Welcome!
status-restored = You have restored your status. Welcome back!

# Utils

pagination-tips = To view previous or next payments, use the buttons below