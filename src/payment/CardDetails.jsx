import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import ReactTooltip from 'react-tooltip';
import { faLock, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import {
  faCcAmex,
  faCcDiscover,
  faCcMastercard,
  faCcVisa,
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { injectIntl, FormattedMessage } from '@edx/frontend-i18n';

import FormInput from '../common/components/FormInput';
import FormSelect from '../common/components/FormSelect';

const CardValidator = require('card-validator');

export const SUPPORTED_CARDS = {
  'american-express': { id: '003', icon: faCcAmex },
  discover: { id: '004', icon: faCcDiscover },
  mastercard: { id: '002', icon: faCcMastercard },
  visa: { id: '001', icon: faCcVisa },
};

export class CardDetailsComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cardId: '',
      cardIcon: null,
      cardNumber: '',
      securityCode: '',
      cardExpiryDate: '-',
    };
  }

  getNumericOptions(start, end) {
    const items = [];
    for (let i = start; i <= end; i += 1) {
      items.push(<option key={i} value={i}>{i}</option>);
    }
    return items;
  }

  handleCardNumberChange = (event, newValue) => {
    let cardIcon = null;
    let cardId = '';
    const { card } = CardValidator.number(newValue);
    if (card) {
      const cardInfo = SUPPORTED_CARDS[card.type];
      cardId = cardInfo.id;
      cardIcon = cardInfo.icon;
    }
    this.setState({ cardId, cardIcon, cardNumber: newValue });
  };

  handleSecurityCodeChange = (event, newValue) => {
    this.setState({ securityCode: newValue });
  };

  updateCardExpiryMonth = (event, newValue) => {
    const cardExpiryParts = this.state.cardExpiryDate.split('-');
    cardExpiryParts[0] = newValue.padStart(2, '0');
    this.setState({ cardExpiryDate: cardExpiryParts.join('-') });
  };

  updateCardExpiryYear = (event, newValue) => {
    const cardExpiryParts = this.state.cardExpiryDate.split('-');
    cardExpiryParts[1] = newValue;
    this.setState({ cardExpiryDate: cardExpiryParts.join('-') });
  };

  renderExpirationMonthOptions() {
    return [
      <option key="Month" value="">Month</option>,
      ...this.getNumericOptions(1, 12),
    ];
  }

  renderExpirationYearOptions() {
    const currentYear = new Date().getFullYear();
    return [
      <option key="Year" value="">Year</option>,
      ...this.getNumericOptions(currentYear, currentYear + 15),
    ];
  }

  render() {
    const { submitting } = this.props;
    return (
      <div className="basket-section">
        <h2 className="section-heading">
          <FormattedMessage
            id="payment.card.details.billing.information.heading"
            defaultMessage="Billing Information"
            description="The heading for the credit card details billing information form"
          />
        </h2>

        <div className="row">
          <div className="col-lg-6 form-group">
            <label htmlFor="cardNumber">
              <FormattedMessage
                id="payment.card.details.number.label"
                defaultMessage="Card Number (required)"
                description="The label for the required credit card number field"
              />
            </label>
            <Field
              id="cardNumber"
              name="cardNumber"
              component={FormInput}
              type="text"
              required
              disabled={submitting}
              onChange={this.handleCardNumberChange}
            />
            <input type="hidden" name="card_number" value={this.state.cardNumber} />
            <input type="hidden" name="card_type" value={this.state.cardId} />
            <FontAwesomeIcon icon={this.state.cardIcon} className="card-icon" />
            <FontAwesomeIcon icon={faLock} className="lock-icon" />
          </div>
          <div className="col-lg-6 form-group">
            <label htmlFor="securityCode">
              <FormattedMessage
                id="payment.card.details.security.code.label"
                defaultMessage="Security Code (required)"
                description="The label for the required credit card security code field"
              />
            </label>
            <span data-tip data-for="securityCodeHelp">
              <FontAwesomeIcon icon={faQuestionCircle} />
            </span>
            <ReactTooltip id="securityCodeHelp" place="bottom" effect="solid">
              <FormattedMessage
                id="payment.card.details.security.code.help.text"
                defaultMessage="The three last digits in the signature area on the back of your card. For American Express, it is the four digits on the front of the card."
                description="The help text for the required credit card security code field"
              />
            </ReactTooltip>
            <Field
              id="securityCode"
              name="securityCode"
              component={FormInput}
              type="password"
              required
              disabled={submitting}
              onChange={this.handleSecurityCodeChange}
            />
            <input type="hidden" name="card_cvn" value={this.state.securityCode} />
            <FontAwesomeIcon icon={faLock} className="lock-icon" />
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 form-group">
            <label htmlFor="cardExpirationMonth">
              <FormattedMessage
                id="payment.card.details.expiration.month.label"
                defaultMessage="Expiration Month (required)"
                description="The label for the required credit card expiration month field"
              />
            </label>
            <Field
              id="cardExpirationMonth"
              name="cardExpirationMonth"
              component={FormSelect}
              options={this.renderExpirationMonthOptions()}
              required
              disabled={submitting}
              onChange={this.updateCardExpiryMonth}
            />
          </div>
          <div className="col-lg-6 form-group">
            <label htmlFor="cardExpirationYear">
              <FormattedMessage
                id="payment.card.details.expiration.year.label"
                defaultMessage="Expiration Year (required)"
                description="The label for the required credit card expiration year field"
              />
            </label>
            <Field
              id="cardExpirationYear"
              name="cardExpirationYear"
              component={FormSelect}
              options={this.renderExpirationYearOptions()}
              required
              disabled={submitting}
              onChange={this.updateCardExpiryYear}
            />
            <input type="hidden" name="card_expiry_date" value={this.state.cardExpiryDate} />
          </div>
        </div>
      </div>
    );
  }
}

CardDetailsComponent.propTypes = {
  submitting: PropTypes.bool,
};

CardDetailsComponent.defaultProps = {
  submitting: false,
};

export default connect()(injectIntl(CardDetailsComponent));
