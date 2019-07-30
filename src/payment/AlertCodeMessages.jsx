import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-i18n';
import { Hyperlink } from '@edx/paragon';
import LocalizedPrice from './order-summary/LocalizedPrice';

// eslint-disable-next-line import/prefer-default-export
export const SingleEnrollmentCodeWarning = ({ values }) => (
  <React.Fragment>
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
  </React.Fragment>
);

SingleEnrollmentCodeWarning.propTypes = {
  values: PropTypes.shape({
    courseAboutUrl: PropTypes.string,
  }).isRequired,
};

export const EnrollmentCodeQuantityUpdated = ({ values }) => (
  <React.Fragment>
    <FormattedMessage
      id="payment.messages.enrollment-code-product-info.quantity.updated.header"
      defaultMessage="We've updated your quantity."
      description="Notifies the user that they have updated the quantity of enrollment codes"
      tagName="h6"
    />
    <FormattedMessage
      id="payment.messages.enrollment-code-product-info.quantity.updated..body"
      defaultMessage="Your cart includes {quantity} enrollment codes at a total cost of {price}, that you will receive via email."
      description="Notifies the user the quantity and price of codes they have in their cart."
      values={{
        quantity: values.quantity,
        price: <LocalizedPrice amount={values.price} />,
      }}
    />
  </React.Fragment>
);

EnrollmentCodeQuantityUpdated.propTypes = {
  values: PropTypes.shape({
    quantity: PropTypes.number,
    price: PropTypes.number,
  }).isRequired,
};
