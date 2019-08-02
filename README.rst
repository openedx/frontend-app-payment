|Build Status| |Coveralls| |npm_version| |npm_downloads| |license|

frontend-app-payment
====================

Please tag **@edx/arch-team** on any PRs or issues.  Thanks.

Introduction
------------

Micro-frontend for the single-page payment/checkout process.

Getting Started
---------------

**Prerequisite**

`Devstack <https://edx.readthedocs.io/projects/edx-installing-configuring-and-running/en/latest/installation/index.html>`_.  If you start Devstack with ``make dev.up.ecommerce`` that should give you everything you need as a companion to this frontend.

**Installation and Startup**

1. Clone this repo:

  ``git clone https://github.com/edx/frontend-app-payment.git``

2. Install npm dependencies:

  ``cd frontend-app-payment && npm install``

3. Start the dev server:

  ``npm start``

The dev server is running at `http://localhost:1998 <http://localhost:1998>`_.

By default it will show an empty basket view.

Cart States
-----------

**Empty Cart**

Visit `http://localhost:1998 <http://localhost:1998>`_ without adding any product to your cart.

**Single Course Purchase**

Assuming you have a fairly standard devstack setup, if you click the "Upgrade to Verified" button on the Demonstration Course on `http://localhost:18000/dashboard <http://localhost:18000/dashboard>`_, that will populate your cart with a single course so that you see the cart, order summary, and checkout form.

**Other Types**

*To be added.*

Build Process Notes
-------------------

**Production Build**

The production build is created with ``npm run build``.

**Purgecss**

The production Webpack configuration for this repo uses `Purgecss <https://www.purgecss.com/>`_
to remove unused CSS from the production css file. In webpack/webpack.prod.config.js the Purgecss
plugin is configured to scan directories to determine what css selectors should remain. Currently
the src/ directory is scanned along with all @edx/frontend-component* node modules and paragon.
If you add and use a component in this repo that relies on HTML classes or ids for styling you
must add it to the Purgecss configuration or it will be unstyled in the production build.


Appendix A: Local Dev Server + Stage API
----------------------------------------

If you would like to run this frontend against stage.edx.org you can run npm run start:stage and
access your development server at https://local.stage.edx.org:1998 after the initial setup
described below:

- Update the /etc/hosts file on your computer and add `127.0.0.1 local.stage.edx.org`.
- Log into stage `https://courses.stage.edx.org/login`.
- Run `npm run start:stage` in this project directory
- Navigate to `https://local.stage.edx.org:1998`. You will see a warning that this page
  is unsecured because there is no valid SSL certificate. Proceed past this screen by
  clicking the "Advanced" button on the bottom left and then click the revealed link:
  "Proceed to local.stage.edx.org (unsafe)".

.. |Build Status| image:: https://api.travis-ci.org/edx/frontend-app-ecommerce.svg?branch=master
   :target: https://travis-ci.org/edx/frontend-app-ecommerce
.. |Coveralls| image:: https://img.shields.io/coveralls/edx/frontend-app-ecommerce.svg?branch=master
   :target: https://coveralls.io/github/edx/frontend-app-ecommerce
.. |npm_version| image:: https://img.shields.io/npm/v/@edx/frontend-app-ecommerce.svg
   :target: @edx/frontend-app-ecommerce
.. |npm_downloads| image:: https://img.shields.io/npm/dt/@edx/frontend-app-ecommerce.svg
   :target: @edx/frontend-app-ecommerce
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-app-ecommerce.svg
   :target: @edx/frontend-app-ecommerce
