6. Polling
==========

Status
------

Draft

.. After acceptance, becomes, for example:

    Accepted (2023-02-01)


Context
-------

We want frontend-app-payment to listen for an event.

For example, our payment provider Stripe offers `webhooks`_. Stripe webhooks informs our backend when a payment is paid. When our server receives a webhook from Stripe that the payment is paid, we would like frontend-app-payment to know that has happened and forward a learner onwards in their user journey.

.. _webhooks: https://stripe.com/docs/webhooks/stripe-events 


Decision
--------

We will poll the backend for updates for an event.

Consequences
------------

Polling taxes the backend because it constantly hits the same API.

Rejected Alternatives
---------------------

Websockets
~~~~~~~~~~

We do not know of any use of websockets in MFEs at this time.

Synchronous HTTP Requests
~~~~~~~~~~~~~~~~~~~~~~~~~

Third-Party Services
~~~~~~~~~~~~~~~~~~~~

We could use a third-party service like `Braze`_, `Amazon Simple Queuing Service (SQS)`_, or `Amazon Simple Notification Service (SNS)`_.

However:

Braze focuses on more narrow use cases like push notifications or in-app messages. It does not provide generic event queuing.

TODO:

SQS does not...

`Braze`_: https://www.braze.com/docs/developer_guide/platform_integration_guides/web
`Amazon Simple Queuing Service (SQS)`_: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sqs-examples-send-receive-messages.html 
`Amazon Simple Notification Service (SNS)`_:

1. Polling
2. Websockets
3. Make Create Order Synchronous
4. Amazon SQS/SNS
5. Braze


Disadvantage of Websockets and Make Create Order Synchronous is that we must hold one connection open per user who wishes to Retrieve Order Details.

Go with Polling because it is simpler to create from the client-side. We will have to be careful to monitor potentials for race conditions.

To mitigate this, we may want to create a cache in Redis to reject API requests that are still in flight.

Need to make sure everything still works without the cache.

Open question: What happens when there is a state mismatch between the cache and the backend? How will we know to resolve this?

References
----------
* `Stripe Custom Actions`_
* `Stripe PCI Compliance`_

.. _Stripe PCI Compliance: https://stripe.com/docs/security/guide
