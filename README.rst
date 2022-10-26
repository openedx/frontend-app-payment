|Build Status| |Coveralls| |npm_version| |npm_downloads| |license|

frontend-app-payment
====================

Please tag **@edx/revenue-squad** on any PRs or issues.  Thanks.

Introduction
------------

Micro-frontend for the single-page payment/checkout process; order history and receipt pages are still served by the ecommerce service. This application only supports PayPal and Cybersource credit card payments.

Getting Started
---------------

This MFE is bundled with `Devstack <https://github.com/openedx/devstack>`_, see the `Getting Started <https://github.com/openedx/devstack#getting-started>`_ section for setup instructions.

Once set up, this frontend and all its prerequisites can be started with:

.. code-block::

  cd devstack
  make dev.up.frontend-app-payment

The frontend runs at `http://localhost:1998 <http://localhost:1998>`_, though it is rare to interact with it directly because the course key needs to be passed in a URL parameter to determine basket contents to check out.  Rather, log into the LMS at http://localhost:18000/login and enroll in a course, choosing to upgrade to be taken to the checkout page.

Development
-----------

To work on this frontend: with the prerequisites running as above, bring down the ``frontend-app-payment`` container, then start the development server *outside* Docker as follows:

.. code-block::

  cd devstack
  make dev.down.frontend-app-payment
  cd ../frontend-app-payment
  npm ci
  npm start

Note: ``npm ci`` is recommended over ``npm install`` to match the way CI and production builds work and avoid unintentional changes to ``package_lock.json`` when doing other work.

The dev server also runs at `http://localhost:1998 <http://localhost:1998>`_, but again, it is rare to interact with it directly.  By default it will show an empty basket view.

Configuration
-------------

This frontend is configured in ecommerce Django admin:

In ``Core > Site configurations > [YOUR CONFIG]``, set "Enable Microfrontend for Basket Page" and set the accompanying url to point to this frontend.

Devstack is configured this way by default.

API Documentation
-----------------

To view the API documentation, navigate to `http://localhost:18130/api-docs`_ and log in with a staff account. Related endpoints:

  - GET /bff/payment/v0/payment/
  - POST /bff/payment/v0/quantity/
  - POST /bff/payment/v0/vouchers/
  - DELETE /bff/payment/v0/vouchers/{voucherid}
  - POST /payment/cybersource/api-submit/
  - POST /payment/cybersource/apple-pay/authorize/
  - POST /payment/cybersource/apple-pay/start-session/

Note: bff means "Backend for frontend". BFF endpoints are designed specifically for this application.

Cart States
-----------

**Empty Cart**

Visit `http://localhost:1998 <http://localhost:1998>`_ without adding any product to your cart.

**Single Course Purchase**

Assuming you have a fairly standard devstack setup, if you click the "Upgrade to Verified" button on the Demonstration Course on `http://localhost:18000/dashboard <http://localhost:18000/dashboard>`_, that will populate your cart with a single course so that you see the cart, order summary, and checkout form.

**Other Types**

*To be added. (Program Purchase, Bulk Enrollment Code Purchase)*

Glossary
--------

**Cart Summary**

A list of the product(s) being purchased. Also contains the update quantity form.

**Order Summary**

A breakdown of the price of the product(s) being purchased.  Also home to the coupon form and offers display.

**Order Details**

A descriptive paragraph of text which provides additional context on the purchase.  Varies by product type.

**Payment Methods**

  Cybersource

  Apple Pay

  PayPal

**Feedback**

A reusable component responsible for displaying alert messages at the top of the page.  Can display success, warning, error, and info messages.  Provides utilities to add messages and clear them.  Is application agnostic (i.e., isn't specific to this micro-frontend)

**Coupon**

A code that provides a discount. It can apply to courses and programs. It can be created by edX or partners.  A coupon is based on a code.

More on Enterprise coupons: `Ecommerce (Enterprise) coupons explained <https://openedx.atlassian.net/wiki/spaces/SOL/pages/858620328/Ecommerce+Enterprise+Coupons+Explained>`_.

**Offer**

A discount offered to a user automatically. It can be applied to a subset of users or everyone. It can be created by edX or partners. An offer is based on a user group.

Project Structure
-----------------

The source for this project is organized into nested submodules according to the ADR `Feature-based Application Organization <https://github.com/openedx/frontend-cookiecutter-application/blob/master/docs/decisions/0002-feature-based-application-organization.rst>`_.

Breakdown of the ``src`` directory:

**assets**
  Image assets used by the top-level code.

**common**
  Boilerplate code that is common to many of our frontend applications.  Currently copied from place to place, it is intended to eventually live in `edx/frontend-common <https://github.com/openedx/frontend-common>`_.

**components**
  Top-level App.jsx component, which is 95% shared across frontends and will eventually get similar treatment to the ``common`` directory.

**data**
  Top-level redux/redux-saga reducers and sagas.

**feedback**
  A reusable component which displays user feedback messages as alerts at the top of the page.  While it is currently only in use by this application, it's intended to be generic and shared across applications, so should remain free of payment-specific code.  It will eventually live in either `edx/paragon <https://github.com/openedx/paragon>`_ or its own repo.

**i18n**
  The language configuration for the app.

**payment**
  The guts of this app.  This includes all payment forms, payment methods, order details, data models, and associated API calls.

  Please see src/payment/README.rst for more detail.

**store**
  The redux store configuration for dev and production.

Configuration
-------------

All API keys, endpoints, etc are provided through the webpack EnvironmentPlugin at build time as configured in `webpack/`

Notable Libraries Leveraged
---------------------------

This application uses:

  - redux
  - redux-saga
  - redux-saga-routines
  - redux-form

Build Process Notes
-------------------

**Production Build**

The production build is created with ``npm run build``.

Internationalization
--------------------

Please see `edx/frontend-i18n <https://github.com/openedx/frontend-i18n>`_ for documentation on internationalization.  The repository README.rst explains how to use it, and the `How To <https://github.com/openedx/frontend-i18n/blob/master/docs/how_tos/i18n.rst>`_ has more detail.

Localized Pricing
-----------------

The LocalizedPrice.jsx component makes use of a currency cookie to determine the user's preferred currency.  The code for localized pricing can be found in:

**src/payment/cart/LocalizedPrice.jsx**

This is the localized pricing react component.  If a currency cookie is found, it displays the price in that currency using the specified conversion rate.

**src/payment/data/reducers.js**

The "currency" reducer reads the cookie as part of its initial state.

**src/payment/data/selectors.js**

The "localizedCurrencySelector" reads the currency information defined in redux and is used to provide it to the LocalizedCurrency.jsx component.

Appendix A: Using Local Dev Server with stage.edx.org APIs
----------------------------------------------------------

If you would like to run this frontend against stage.edx.org you can run ``npm run start:stage`` and access your development server at `https://local.stage.edx.org <https://local.stage.edx.org>`_ after the initial setup described below:

- Update the ``/etc/hosts`` file on your computer and add:

  ``127.0.0.1 local.stage.edx.org``.

- Log into stage: `https://courses.stage.edx.org/login <https://courses.stage.edx.org/login>`_.
- Run `npm ci` in this project directory
- Start the frontend's dev server in staging mode:

  ``npm run start:stage``

- Navigate to `https://local.stage.edx.org <https://local.stage.edx.org>`_. You will see a warning that this page is unsecured because there is no valid SSL certificate. Proceed past this screen by clicking the "Advanced" button on the bottom left and then click the revealed link: "Proceed to local.stage.edx.org (unsafe)".

.. |build Status| image:: https://github.com/openedx/frontend-app-payment/actions/workflows/ci.yml/badge.svg
   :target: https://github.com/openedx/frontend-app-payment/actions/workflows/ci.yml
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-app-payment.svg
   :target: @edx/frontend-app-payment


Appendix B: Adding No-Op Stuff to Test Sandbox Deploys
----------------------------------------------------------

Let's try this.
