Feedback & Error Handling HOWTO
===============================

Status: Draft


Introduction
------------

frontend-app-payment has a `feedback module`_ that given proper configuration
will display messages to the user that can be crafted by any API
frontend-app-payment contacts.

This HOWTO explains how the API should act to use this feedback module within
the `payment module`_ and overviews where and how frontend-app-payment puts the
message from the API's response.

This HOWTO also explores how frontend-app-payment handles API call errors in
the payment module. The payment module catches most API call errors and sends
them to the feedback module to show the user a nicely formatted error.

.. _feedback module: https://github.com/openedx/frontend-app-payment/tree/master/src/feedback
.. _payment module: https://github.com/openedx/frontend-app-payment/tree/master/src/payment

.. contents:: Table of Contents
   :depth: 1


How does the feedback module work?
----------------------------------

Via exceptions
~~~~~~~~~~~~~~

* `payment/data/service.js`_ catches most exceptions thrown by the Axios client
  calling the APIs and runs `handleBasketApiError()`_

* `handleBasketApiError()`_ calls `payment/data/handleRequestError.js`_, which
  reformats and transforms the feedback module JSON and re-throws the error.

* `payment/data/sagas.js`_ catches most errors thrown by
  `payment/data/service.js`_ and calls `feedback/data/sagas.js`_
  `handleErrors()`_.

* `handleErrors()`_ uses the ``addMessage()`` action and the associated
  `addMessage() reducer helper function`_ to store the feedback message in
  Redux's store.

* `feedback/AlertList.jsx`_ is connected to the Redux store and formats each
  feedback message into the props of a new `feedback/AlertMessage.jsx`_.

.. _addMessage() reducer helper function: https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/feedback/data/reducers.js#L22-L34
.. _feedback/AlertList.jsx: https://github.com/openedx/frontend-app-payment/blob/master/src/feedback/AlertList.jsx
.. _feedback/AlertMessage.jsx: https://github.com/openedx/frontend-app-payment/blob/master/src/feedback/AlertMessage.jsx

.. _Via messages:

Via messages
~~~~~~~~~~~~

* `payment/data/sagas.js`_ passes selected API responses into
  `handleMessages()`_.

* `handleMessages()`_ works similarly to `handleErrors()`_. See above.

.. _handleMessages(): https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/feedback/data/sagas.js#L39


How do I add a new error message in the payment module?
-------------------------------------------------------

* In `payment/data/service.js`_, add ``.catch(handleBasketApiError)`` to the
  method chain of the Axios request (usually ``post()`` or ``get()``) to
  reformat the error into the correct format, then rethrow.

    * `handleBasketApiError()`_ is a thin wrapper around
      `payment/data/handleRequestError.js`_.

* In `payment/data/sagas.js`_, add a try-catch that catches the error
  reformatted and rethrown by `handleBasketApiError()`_ and calls the
  appropriate error handler:

    * ``yield call(handleErrors, error, clearExistingMessages)`` for the
      `List of errors`_ or `Single error`_ formats
    * ``yield call(handleReduxFormValidationErrors, error,
      clearExistingMessages)`` for the `Dictionary of field errors`_ format

* In `payment/AlertCodeMessages.jsx`_, add a new component for your message.

* In `components/formatted-alert-list/FormattedAlertList.jsx`_, add the new
  component you created in ``<AlertCodeMessages>`` to ``messagesCode`` under
  key named after the ``error_code`` you want the API to call to trigger this
  error message.

.. _payment/data/service.js: https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/payment/data/service.js
.. _payment/data/handleRequestError.js: https://github.com/openedx/frontend-app-payment/blob/master/src/payment/data/handleRequestError.js
.. _payment/data/sagas.js: https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/payment/data/sagas.js
.. _payment/AlertCodeMessages.jsx: https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/payment/AlertCodeMessages.jsx
.. _components/formatted-alert-list/FormattedAlertList.jsx: https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/components/formatted-alert-list/FormattedAlertList.jsx


What should the API do?
-----------------------

Return a JSON response with in one of the following formats:

.. contents:: :local:

The feedback module will ignore dictionary keys not listed in the formats
below. Thus, it is safe to include additional keys in the API's response.

Send the JSON response with a HTTP status code of a `client error (4xx)`_ or
`server error (5xx)`_ for all formats except `List of messages`_.

The implementation of these formats are in
`payment/data/handleRequestError.js`_, which transforms these formats into the
format required by `feedback/data/sagas.js`_.

.. _client error (4xx): https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses
.. _server error (5xx): https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses
.. _feedback/data/sagas.js: https://github.com/openedx/frontend-app-payment/blob/master/src/feedback/data/sagas.js

.. _List of messages:

Format: List of messages
~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: json

    {
        "messages": [
            {
                "data": "",
                "code": "",
                "message_type": "",
                "user_message": ""
            },
            {
                "data": "",
                "code": "",
                "message_type": "",
                "user_message": ""
            },
            <...>
        ]
    }

Send this format with a HTTP code for a `successful response (2xx)`_.

.. _successful response (2xx): https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#successful_responses

.. _List of errors:

Format: List of errors
~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: json

    {
        "errors": [
            {
                "data": "",
                "error_code": "",
                "message_type": "",
                "user_message": ""
            },
            {
                "data": "",
                "error_code": "",
                "message_type": "",
                "user_message": ""
            },
            <...>
        ]
    }

This format is identical to the `List of messages`_, but uses ``error_code``
instead of ``code``.

.. _Dictionary of field errors:

Format: Dictionary of field errors
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: json

    {
        "field_errors": {
            "<field_name_1>": {
                "error_code": "",
                "user_message": ""
            },
            "<field_name_2>": {
                "error_code": "",
                "user_message": ""
            },
            <...>
        }
    }

``<field_name_1>`` and ``<field_name_2>`` are placeholders for the `name`_ of
the `Redux Form Field`_ the error message should be placed next to.

The handling of ``field_errors`` is done by `Redux Form's stopSubmit`_ in
`handleReduxFormValidationErrors()`_. ``handleReduxFormValidationErrors()`` transforms
``field_errors`` into the format required by `Redux Form's SubmissionError`_.

.. _name: https://redux-form.com/8.3.0/docs/api/field.md/#-code-name-string-code-required-
.. _Redux Form's stopSubmit: https://redux-form.com/8.3.0/docs/api/actioncreators.md/#-code-stopsubmit-form-string-errors-object-code-
.. _Redux Form's SubmissionError: https://redux-form.com/8.3.0/docs/api/submissionerror.md/
.. _handleReduxFormValidationErrors(): https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/payment/data/sagas.js#L59-L64

.. _Single error:

Format: Single error
~~~~~~~~~~~~~~~~~~~~

.. code-block:: json

    {
        "error_code": "",
        "user_message": ""
    }

.. note::

    For reasons unknown, this format undergoes some `custom handling`_
    exclusively for the ``handleSubmitPayment`` saga.

.. _custom handling: https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/payment/data/sagas.js#L243-L244


What values should the API use?
-------------------------------

All values are optional, but the API must specify at least ``code``,
``error_code``, or ``user_message``.

``user_message`` is a string with the message that the user should see.

``code`` or ``error_code`` are strings that usually identify a pre-built
`AlertMessage`_ component to show. It overrides ``user_message``.

``data`` will be passed to the pre-built ``<AlertMessage>`` component in a prop
called ``values``.

``message_type`` is a string that changes the ``alertType`` of the
`StatusAlert`_ shown. See `MESSAGE_TYPE to ALERT_TYPE mapping`_ for valid
values of ``message_type`` and which ``alertType`` they will trigger.

.. _StatusAlert: https://paragon-openedx.netlify.app/components/statusalert/
.. _AlertMessage: https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/feedback/AlertMessage.jsx
.. _MESSAGE_TYPE to ALERT_TYPE mapping: https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/feedback/AlertMessage.jsx#L7C1-L13


Which format should the API use?
--------------------------------

The `List of messages`_ and `List of errors`_ will put the feedback in any
`AlertList`_ on the page.

The `Dictionary of field errors`_ will put feedback next to the `Redux
Form Field`_ whose ``name`` matches a key in the dictionary of field errors.

Sending the message in the `Single error`_ format will result in the same
experience as sending the message in the `List of errors`_ format with a
list of errors of length 1.

.. _AlertList: https://github.com/openedx/frontend-app-payment/blob/master/src/feedback/AlertList.jsx
.. _Redux Form Field: https://redux-form.com/8.3.0/docs/api/field.md/


What error codes can I use?
---------------------------

Some error codes are connected to pre-built components. See:

* `FormattedAlertList`_ for the `AlertList`_ component
* `AlertCodeMessages`_ for the formatted and internationalized `AlertMessage`_
  components.

.. _FormattedAlertList: https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/components/formatted-alert-list/FormattedAlertList.jsx#L34-L58
.. _AlertCodeMessages: https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/payment/AlertCodeMessages.jsx


What is the fallback error?
---------------------------

If a saga calls `handleErrors()`_ but the API response is not in one of the
formats above or ``error_code`` is ``fallback-error``, ``handleErrors()`` will
throw up the `FallbackErrorMessage`_.

.. _FallbackErrorMessage: https://github.com/openedx/frontend-app-payment/blob/master/src/feedback/FallbackErrorMessage.jsx
.. _handleErrors(): https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/feedback/data/sagas.js#L10C22-L10C22


How to clear the list of feedback?
----------------------------------

In `payment/data/sagas.js`_, either:

* Run `feedback/data/actions.js`_ ``clearMessages()``

* Pass ``true`` for ``clearExistingMessages`` when calling `handleErrors()`_ or
  `handleMessages()`_.


.. _feedback/data/actions.js: https://github.com/openedx/frontend-app-payment/blob/master/src/feedback/data/actions.js


How do I send an error message through a URL parameter?
-------------------------------------------------------

`handleMessages()`_ accepts a third parameter, which is meant to be
``window.location.search``, the `query string`_ of the user's URL.

``handleMessages()`` will put any parameter of the query string called
``error_message`` into an error-type message and show it to the user.

See the `URL parameter error message implementation`_.

.. _query string: https://developer.mozilla.org/en-US/docs/Web/API/Location/search
.. _URL parameter error message implementation: https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/feedback/data/sagas.js#L49-L53


When are snake_case dictionary keys auto-converted to camelCase?
----------------------------------------------------------------

The payment module's `payment/data/service.js`_ (also dubbed the
`PaymentApiService`_ in payment/data/sagas.js) funnels many but not all API
responses through `transformResults`_, which recursively converts snake_case
dictionary keys of the response into camelCase.

This was done because the convention for Python backends generating the API
responses is to use snake_case, while the convention for JavaScript frontends
processing the API responses is to use camelCase.

See `payment/data/service.js`_ for if and when `transformResults`_ is used.

`payment/data/handleRequestError.js`_ also converts the top-level keys
``error_code`` and ``user_message`` and ``message_type`` into camelCase.

.. _PaymentApiService: https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/payment/data/sagas.js#L34
.. _transformResults: https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/payment/data/utils.js#L158-L172


What about internationalization?
--------------------------------

Prefer using ``error_code``. It uses a pre-built component which should support
internationalization like any other component with translatable strings in
frontend-app-payment.


For more information
--------------------

See `Feedback module's README and components`_, and especially the
implementation in `feedback/data/sagas.js`_.

.. _Feedback module's README and components: https://github.com/openedx/frontend-app-payment/tree/master/src/feedback


Future work
-----------

.. contents:: :local:

Remove special error codes
~~~~~~~~~~~~~~~~~~~~~~~~~~
There are certain error codes which receive special handling due to using
pre-built APIs that do not follow the format of the feedback module in the:

* `feedback/data/sagas.js`_

    * ``basket-changed-error-message``
    * ``dynamic-payment-methods-country-not-compatible``
    * ``transaction-declined-message``
    * ``error_message`` in URL parameters

* `payment/data/handleRequestError.js`_

    * ``sku_error`` (Not an error code. See also `handleSDNCheckFailure`_.)
    * ``payment_intent_unexpected_state``

It may be beneficial for future refactors to minimize, deprecate, or
despecialize the error codes with special handling.

.. _handleSDNCheckFailure: https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/feedback/data/sagas.js#L67-L79

Remove special fields names
~~~~~~~~~~~~~~~~~~~~~~~~~~~
When using the `Dictionary of field errors`_ format, certain key names in
the dictionary of field errors will be transformed into another field name
using a utility function called ``convertKeyNames``. See `utils.js`_.

It would be good to deprecate this transformation by having the backend send
correct key names.

.. _utils.js: https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/payment/data/utils.js#L185-L188

Tame throw-catch bonanza
~~~~~~~~~~~~~~~~~~~~~~~~

`handleBasketApiError()`_ and `handleApiError()`_ are thin wrappers around
`handleRequestError()`_. The purpose of this wrapping is unclear as all three
functions serve to catch exceptions, reformat them, then rethrow.

The wrapping may be for making stack traces more local to the actual site of
the error. Check to see if these wrappers can be refactored out.

.. _handleBasketApiError(): https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/payment/data/service.js#L12-L28

.. _handleApiError(): https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/payment/data/handleRequestError.js#L104-L116

.. _handleRequestError(): https://github.com/openedx/frontend-app-payment/blob/1d631c51035eb8405ce9b03e0fa64a5a6e386268/src/payment/data/handleRequestError.js#L46-L101

Standardize use of transformResults
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Fix inconsistant use of `transformResults`_ in `payment/data/service.js`_.
