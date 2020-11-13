4. iFrame Credit Card Handling
------------------------------

Status
------

Draft

Context
-------

Credit card numbers and security codes are very sensitive classes of data. They are closely protected by the Payment Card Industry Data Security Standard (PCI DSS). For merchants to process credit cards they must be compliant with this standard. Unless transactions volumes are very high, the PCI DSS does not require an external certification, instead requiring merchants to complete a Self-Assessment Questionnaire (SAQ). The simplest version of this questionnaire is only applicable if the merchant completely outsources the handling, storage and processing of the sensitive credit card data to a PCI compliant vendor. This requires the vendor hosting all data entry elements. A common practice used by payment vendors is to offer an iframe integration where the merchant controls the checkout experience, however, the sensitive fields are injected into the flow via an iframes. Browser security controls prevent the host page from being able to access the sensitive data within the iframes. When the user is ready to checkout, the sensitive data is converted into an opaque token that is then given to the merchant to authorize the payment. This architecture has been broadly adopted by the industry and is used by major vendors like Stripe and Baintree to reduce the compliance burden for merchants integrating their payment widgets. This method dramatically reduces the risk of malicious open-source third-party dependencies harvesting credit card numbers, or accidental leakage of sensitive credit card data by developers making changes to the software since the code running on frontend-app-payment no longer has access to the sensitive data.

Cybersource also provides an integration method called "Silent Order Post" (SOP) that allows merchants to put a <form> element on the basket page that directly posts to Cybersource allowing the merchant to avoid sending the sensitive data to back-end servers. This has been the method that frontend-app-payment has been using since it was initially created.

Cybersource also provides an SDK called the "Flex Microform SDK" that allows merchants (like Open edX sites) to easily use the iframe integration method to embed the sensitive widgets directly into existing basket pages in a way that is transparent to the user.

Decision
--------

frontend-app-payment will now use the Flex Microform SDK to handle credit card payments instead of SOP.

Consequences
------------

1. The lifecycle of the page changes since we need to load and initialize the SDK in order to render the credit card number and CVN code form fields.
2. The form fields are no longer part of the payment form, instead they are iframe elements. We have to do some work to make them behave like normal form fields when they aren't. For example: we style them to look like normal fields, we have special validation error handling to mimic the other fields etc.
3. The SDK requires us to generate a "capture context" in order to initialize the fields. That capture context is only valid for 15 minutes. We need to refresh it every 15 minutes. When we refresh, we have to clear out any data entered into the credit card number and CVN fields. Additionally, the capture context must be generated using sensitive secrets. These secrets must be managed on the back-end so frontend-app-payment must make an AJAX request to fetch the capture context prior to rendering the credit card number and CVN fields.
4. If Cybersource has a bug in their SDK javascript, it can prevent users from checking out.
5. When the user clicks "Place Order" their credit card information is transformed into a transient payment token (a JWT) that can be used in lieu of their credit card number to authorize payments. However, the SOP API does not accept this type of token, so we had to switch over to using the Cybersource REST API to authorize the payment. This means that instead of direct POSTing the data to Cybersource via an HTML form, we instead make an AJAX request to the ecommerce back-end which, in turn, makes a synchronous HTTP request to Cybersource's servers.

Flow Diagram
------------

.. image:: images/pci_microform_flow.png
  :width: 800
  :alt: PCI Microform Flow

Sequence Diagram
------------

.. image:: images/flex_microform_seq.png
  :width: 800
  :alt: PCI Microform Sequence Diagram

References
----------