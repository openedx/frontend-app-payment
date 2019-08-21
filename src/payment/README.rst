payment module
==============

Code Structure
--------------


**assets**
  Image assets used by the payment module.  Also includes a .sketch file used to build the app's interfaces.

**data**
  Redux code and API calls for loading the basket, adding and removing coupons, and updating cart quantity.

**payment/cart**
  Components that display messaging around the contents of a user's cart, price
  information, currency, and coupon information.

**payment/checkout**
  Components that allow the user to select a payment method and input payment
  information. ``Checkout.jsx`` is responsible for triggering all payment
  submissions and firing submit tracking events.

**payment/payment-methods/apple-pay**
  Components and API calls associated with using Apple Pay as a payment method.

**payment/payment/cybersource**
  Redux code and API calls associated with using Cybersource as a payment method.

**payment/payment-methods/paypal**
  Components and API calls associated with using PayPal as a payment method.

**utils**
  Payment helper utilities.
