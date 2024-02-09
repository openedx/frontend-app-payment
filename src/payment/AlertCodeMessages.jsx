import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@openedx/paragon';
import LocalizedPrice from './cart/LocalizedPrice';

// eslint-disable-next-line import/prefer-default-export
export const SingleEnrollmentCodeWarning = ({ values }) => (
  <>
    <FormattedMessage
      id="payment.messages.enrollment-code-product-info.header"
      defaultMessage="Purchasing just for yourself?"
      description="Asks the user if they are purchasing a course for themselves."
      tagName="h6"
    />
    <FormattedMessage
      id="payment.messages.enrollment-code-product-info.body"
      defaultMessage="If you are purchasing a single code for someone else, please continue with checkout. However, if you are the learner {link}."
      description="Asks the user if they are purchasing a course for themselves and includes a link for them to click on if they are.  The link text is in 'payment.messages.enrollment-code-product-info.link' and should make sense, contextually, with this message."
      values={{
        link: (
          <Hyperlink destination={values.courseAboutUrl}>
            <FormattedMessage
              id="payment.messages.enrollment-code-product-info.link"
              defaultMessage="click here to enroll directly"
              description="A link that takes the user to a page where they can enroll directly."
            />
          </Hyperlink>
        ),
      }}
    />
  </>
);

SingleEnrollmentCodeWarning.propTypes = {
  values: PropTypes.shape({
    courseAboutUrl: PropTypes.string,
  }).isRequired,
};

export const EnrollmentCodeQuantityUpdated = ({ values }) => (
  <>
    <FormattedMessage
      id="payment.messages.enrollment.code.product.info.quantity.updated.header"
      defaultMessage="We've updated your quantity."
      description="Notifies the user that they have updated the quantity of enrollment codes"
      tagName="h6"
    />
    <FormattedMessage
      id="payment.messages.enrollment.code.product.info.quantity.updated.body"
      defaultMessage="Your cart includes {quantity} enrollment codes at a total cost of {price}, that you will receive via email."
      description="Notifies the user the quantity and price of codes they have in their cart."
      values={{
        quantity: values.quantity,
        price: <LocalizedPrice amount={values.price} />,
      }}
    />
  </>
);

EnrollmentCodeQuantityUpdated.propTypes = {
  values: PropTypes.shape({
    quantity: PropTypes.number,
    price: PropTypes.number,
  }).isRequired,
};

export const TransactionDeclined = () => (
  <FormattedMessage
    id="payment.messages.transaction.declined.body"
    defaultMessage="Your payment could not be processed. Please check your payment information or reach out to your bank or financial institution for further assistance."
    description="Asks the user to check their information or contact their payment provider for help."
  />
);

export const PaymentIntentUnexpectedStateError = () => (
  // TEMP TODO: temp copy, not approved by Product/UX yet
  <FormattedMessage
    id="payment.messages.transaction.error.payment_intent_unexpected_state"
    defaultMessage="Your previous payment attempt requires action and needs to be processed. Please reach out to your bank of financial institution for further assistance."
    description="Notifies the user their payment requires action."
  />
);

export const BasketChangedError = () => (
  <FormattedMessage
    id="payment.messages.transaction.error.basket_changed"
    defaultMessage="Your cart has changed since navigating to this page. Please reload the page and verify the product you are purchasing."
    description="Notifies the user their cart has changed, so they can reload the page to see what it actually contains."
  />
);

export const CaptureKeyTimeoutExplanation = () => (
  <FormattedMessage
    id="payment.messages.key.timeout.body"
    defaultMessage="For security, your credit card information will then need to be re-entered to complete your purchase."
    description="Briefly explains the credit card field timeout."
  />
);

export const CaptureKeyTimeoutTwoMinutes = () => (
  <>
    <FormattedMessage
      id="payment.messages.key.timeout.2mins.header"
      defaultMessage="Please complete your purchase within two minutes"
      description="Notifies the user that the credit card fields will time out in two minutes"
      tagName="h6"
    />
    <CaptureKeyTimeoutExplanation />
  </>
);

export const CaptureKeyTimeoutOneMinute = () => (
  <>
    <FormattedMessage
      id="payment.messages.key.timeout.1min.header"
      defaultMessage="Please complete your purchase within one minute"
      description="Notifies the user that the credit card fields will time out in one minute"
      tagName="h6"
    />
    <CaptureKeyTimeoutExplanation />
  </>
);
