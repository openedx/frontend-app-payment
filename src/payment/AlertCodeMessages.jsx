import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-i18n';
import { Hyperlink } from '@edx/paragon';

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
