Feature Toggle HOWTO
====================


Introduction
------------

This HOWTO explains how frontend-app-payment can use Waffle Flags for feature toggling.

.. contents:: Table of Contents


What are Waffle Flags?
----------------------

`django-waffle`_ (Waffle) lets operators toggle features on and off from a backend service's Django admin site.

`Waffle Flags`_ let operators toggle features based on who a user is, whether the query string of the page contains a certain value, or whether a user is part of a random sample. This helps rollout features to different users.

Waffle Flags have a name and a value. The name is the feature set being toggled. The value is whether that feature should be enabled for the current user session. All users assigned the same Waffle Flag value are said to be part of the same Waffle Flag rollout group.

Most Open edX Django backends include django-waffle. See `OEP-17`_.

.. _django-waffle: https://waffle.readthedocs.io/en/stable/index.html
.. _Waffle Flags: https://waffle.readthedocs.io/en/latest/types/flag.html
.. _OEP-17: https://open-edx-proposals.readthedocs.io/en/latest/best-practices/oep-0017-bp-feature-toggles.html


How are Waffle Flags sent to frontend-app-payment?
--------------------------------------------------

Because Waffle is a backend technology, the Waffle Flag value for a user session must be sent to frontend-app-payment.

Waffle Flags must be passed to frontend-app-payment twice, once in the query string, and again in the body of API responses from the backend hosting the Waffle Flag.


In the query string
~~~~~~~~~~~~~~~~~~~

First, users must arrive in frontend-app-payment with a `Waffle Flag testing mode query string parameter`_ in the URL.

frontend-app-payment ensures any user arriving with a `Waffle Flag testing mode query string parameter`_ will pass on that Waffle Flag's name and value to any Open edX backend API requests the user makes.

Specifically: when a user visits any page in frontend-app-payment, frontend-app-payment looks for Waffle Flags in the `query string`_ of a user's URL. `src/index.jsx saves`_ any fields of the query string that start with ``dwft_``. It understands the rest of the field name as the Waffle Flag name, and the value of that field as the Waffle Flag value.

Then, whenever frontend-app-payment calls an Open edX backend using ``getAuthenticatedHttpClient()``, `src/index.jsx intercepts`_ the outgoing API call and tacks on all saved Waffle Flags to the query parameters of the call.

Open edX backends configured with a Waffle Flag in testing mode `will check incoming requests for query parameter keys starting with dwft_ followed by the Waffle Flag's name`_ and will enable or disable the Waffle Flag for the user's session according to the value of that query string parameter.

.. _Waffle Flag testing mode query string parameter: https://waffle.readthedocs.io/en/latest/testing/user.html#querystring-parameter
.. _query string: https://en.wikipedia.org/wiki/Query_string
.. _src/index.jsx saves: https://github.com/openedx/frontend-app-payment/blob/40c96bdc343f455a41858a679233a4c6f7780a63/src/index.jsx#L38-L47
.. _src/index.jsx intercepts: https://github.com/openedx/frontend-app-payment/blob/40c96bdc343f455a41858a679233a4c6f7780a63/src/index.jsx#L94-L104
.. _will check incoming requests for query parameter keys starting with dwft_ followed by the Waffle Flag's name: https://waffle.readthedocs.io/en/latest/testing/user.html#querystring-parameter


In API responses
~~~~~~~~~~~~~~~~

Once the Open edX backend hosting the Waffle Flag is told what the user's Waffle Flag value should be through the query parameter, the backend must perform its usual work, then resend the Waffle Flag value to frontend-app-payment, but this time in the body of its API response to frontend-app-payment.

frontend-app-payment must use the information in the API response to enable or disable the Waffle Flag's frontend-app-payment features, as appropriate.


Why send Waffle Flags via the query string?
-------------------------------------------

Usually, Waffle saves a host-only cookie to persist a Waffle Flag for a user's session. But because the cookie is host-only, frontend-app-payment cannot read a Waffle Flag cookie set by a backend on a different subdomain.

That means it also cannot forward those cookies when making subsequent requests to the backend. If a Waffle Flag is set to rollout a feature to a percentage of users, the backend will have no way to remember what rollout group a user was originally assigned to.

By forwarding received Waffle Flag testing mode query string parameters to subsequent requests to the backend, a user assigned to a Waffle Flag percentage rollout group will continue to be a part of the same rollout group throughout their user journey. 


What should I do?
-----------------

#. In your backend, create your Waffle Flag in Django admin and set it to Testing.

#. Whenever your backend forwards users to frontend-app-payment, add the Waffle Flag to the query string.

   * See `example PR in ecommerce adding redirect_with_waffle_testing_querystring`_.

#. Implement your Waffle Flag in your backend. See `edx-toggles documentation`_.

   * See `example PR in ecommerce adding enable_stripe_payment_processor`_.

#. Include the requesting user's Waffle Flag value in the response to frontend-app-payment's calls to your backend.

   * See `example PR in ecommerce adding enable_stripe_payment_processor`_.

#. Change frontend-app-payment's behavior based on the Waffle Flag value in your backend's response.

   * See `example PR in frontend-app-payment using enableStripePaymentProcessor`_. 

.. _example PR in ecommerce adding redirect_with_waffle_testing_querystring: https://github.com/openedx/ecommerce/pull/3861
.. _example PR in ecommerce adding enable_stripe_payment_processor: https://github.com/openedx/ecommerce/pull/3816
.. _example PR in frontend-app-payment using enableStripePaymentProcessor: https://github.com/openedx/frontend-app-payment/pull/644/files#diff-1729df22be04fe3a3d797b7cd77d61241c04ce1f5d6d4dfd0b498ed4647afb70R172
.. _edx-toggles documentation: https://edx.readthedocs.io/projects/edx-toggles/en/latest/how_to/implement_the_right_toggle_type.html#using-your-toggle


What is an example use case?
----------------------------

The ``enable_stripe_payment_processor`` `ecommerce`_ Waffle Flag was implemented using this HOWTO.

It lets an operator slowly rollout Stripe in frontend-app-payment using ecommerce by performing the following:

#. Log in to ecommerce Django Admin.
#. Under Site Configuration, add ``stripe`` to the comma-separated list of "Payment processors".
#. Under Waffle Flags, create flag ``redirect_with_waffle_testing_querystring``. Set "Everyone" to "Yes".
#. Under Waffle Flags, create flag ``enable_stripe_payment_processor``. Check "Testing" and set "Percent" to the desired percentage of visitors who should be assigned to see the Stripe payment experience.

.. _ecommerce: https://github.com/openedx/ecommerce


Other alternatives
------------------

Instead of a Waffle Flag, you can also use environmental variables (like the ones in `.env`_ ) to toggle features.

* Pro: Simpler to use if you do not need your feature toggle to have different values for each user.
* Con: Will not work if you need to synchronize your feature's rollout groups with a Django waffle flag in another backend.
* Con: Operators must wait for a redeploy for the change in your environmental variable to take effect.

.. _.env: https://github.com/openedx/frontend-app-payment/blob/master/.env


Future work
-----------

It is not necessary to send the waffle flag both in the query string and in the API response. In the future, we could make the value of the Waffle Flag sent via the query string available across frontend-app-payment.
