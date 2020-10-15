import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { getCardIconForType } from '../utils/credit-card';

import FlexMicroformField from './FlexMicroformField';
import { DEFAULT_STATUS } from './constants';

class CreditCardNumberField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cardIcon: null,
    };
  }

  onNumberChange = (data) => {
    let cardIcon = null;
    if (data.card && data.card.length > 0) {
      const { cybsCardType } = data.card[0];
      cardIcon = getCardIconForType(cybsCardType);
      window.microform.fields.number.cybsCardType = cybsCardType;
    }
    this.setState({ cardIcon });
  };

  render() {
    const label = (
      <FormattedMessage
        id="payment.card.details.number.label"
        defaultMessage="Card Number (required)"
        description="The label for the required credit card number field"
      />
    );
    return (
      <div className="col-lg-6 form-group">
        <Field
          id="cardNumber"
          name="cardNumber"
          component={FlexMicroformField}
          props={{
            fieldType: 'number',
            microformStatus: this.props.microformStatus,
            disabled: this.props.disabled,
            onChange: this.onNumberChange,
            label,
          }}
        />
        {this.state.cardIcon !== null && (
          <FontAwesomeIcon icon={this.state.cardIcon} className="card-icon" />
        )}
      </div>
    );
  }
}

CreditCardNumberField.propTypes = {
  microformStatus: PropTypes.string,
  disabled: PropTypes.bool,
};

CreditCardNumberField.defaultProps = {
  microformStatus: DEFAULT_STATUS,
  disabled: false,
};

export default CreditCardNumberField;
