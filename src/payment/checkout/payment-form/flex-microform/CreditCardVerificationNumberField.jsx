import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import FlexMicroformField from './FlexMicroformField';
import { DEFAULT_STATUS } from './constants';

const CreditCardVerificationNumberField = (props) => {
  const label = (
    <FormattedMessage
      id="payment.card.details.security.code.label"
      defaultMessage="Security Code (required)"
      description="The label for the required credit card security code field"
    />
  );
  const helpText = (
    <FormattedMessage
      id="payment.card.details.security.code.help.text"
      defaultMessage="The three last digits in the signature area on the back of your card. For American Express, it is the four digits on the front of the card."
      description="The help text for the required credit card security code field"
    />
  );
  return (
    <div className="col-lg-6 form-group">
      <Field
        id="securityCode"
        name="securityCode"
        component={FlexMicroformField}
        props={{
          fieldType: 'securityCode',
          microformStatus: props.microformStatus,
          disabled: props.disabled,
          label,
          helpText,
        }}
      />
    </div>
  );
};

CreditCardVerificationNumberField.propTypes = {
  microformStatus: PropTypes.string,
  disabled: PropTypes.bool,
};

CreditCardVerificationNumberField.defaultProps = {
  microformStatus: DEFAULT_STATUS,
  disabled: false,
};

export default CreditCardVerificationNumberField;
