########################
Localized Currency HOWTO
########################

************
Introduction
************

This HOWTO explains what the localized currency cookie is and how it is connected to our LocalizedPrice component.

.. contents:: Table of Contents

***************************
What is localized currency?
***************************

This is when we show users prices on the payment page in what we think is the correct currency for where they are. These prices can be rounded, since the final checkout charge will still be in U.S. dollars (USD).

*************
Cookie format
*************

The payment page looks for the ``edx-price-l10n`` cookie.  The contents of this cookie are JSON in this format::

    {"symbol":"$","rate":19.092733,"code":"MXN","countryCode":"MEX"}

However, the string is URL encoded, so the cookie value actually looks like this::

    {%22symbol%22:%22$%22%2C%22rate%22:19.092733%2C%22code%22:%22MXN%22%2C%22countryCode%22:%22MEX%22}

I found that Chrome developer tools didn't want to set a cookie with this value, but the Edit This Cookie extension worked fine.

************************
LocalizedPrice component
************************

The LocalizedPrice component is tied to the value of the localized currency cookie, if one exists, through the React store. If the currency is not USD, this component uses the exchange rate in the cookie to convert the price and to display an asterisk next to it. This asterisk is then matched with a disclaimer message clarifying that the charge will still be in USD.

Unlike most prices, localized currencies are displayed with no decimal places, since they're an estimate anyway.

***********
Future work
***********

Currently, USD is hardcoded as the currency in which we accept payments.  At some point this should become configurable.

***************
Troubleshooting
***************

This hasn't come up yet, but do not be surprised if we eventually see a country code in the cookie that isn't a code that react-intl understands.
