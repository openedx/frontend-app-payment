import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import ReactTooltip from 'react-tooltip';
import { faLock, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-i18n';

import messages from './CardDetails.messages';

import FormInput from './FormInput';
import FormSelect from './FormSelect';

import { getCardIcon } from './utils/credit-card';

export class CardDetailsComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cardIcon: null,
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
    const cardIcon = getCardIcon(newValue);
    this.setState({ cardIcon });
  };

  renderExpirationMonthOptions() {
    const monthText = this.props.intl.formatMessage(messages['payment.page.card.details.month']);

    return [
      <option key="Month" value="">{monthText}</option>,
      ...this.getNumericOptions(1, 12),
    ];
  }

  renderExpirationYearOptions() {
    const yearText = this.props.intl.formatMessage(messages['payment.page.card.details.year']);
    const currentYear = new Date().getFullYear();

    return [
      <option key="Year" value="">{yearText}</option>,
      ...this.getNumericOptions(currentYear, currentYear + 15),
    ];
  }

  render() {
    const { disabled } = this.props;
    return (
      <div className="basket-section">
        <h5 aria-level="2">
          <FormattedMessage
            id="payment.card.details.billing.information.heading"
            defaultMessage="Billing Information"
            description="The heading for the credit card details billing information form"
          />
        </h5>

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
              type="tel"
              required
              disabled={disabled}
              onChange={this.handleCardNumberChange}
              autoComplete="cc-number"
              maxLength="20"
            />
            {this.state.cardIcon !== null && <FontAwesomeIcon icon={this.state.cardIcon} className="card-icon" />}
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
            <span data-tip data-for="securityCodeHelp" className="ml-1">
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
              type="tel"
              required
              disabled={disabled}
              onChange={this.handleSecurityCodeChange}
              autoComplete="cc-csc"
              maxLength="4"
            />
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
              disabled={disabled}
              autoComplete="cc-exp-month"
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
              disabled={disabled}
              autoComplete="cc-exp-year"
            />
          </div>
        </div>
      </div>
    );
  }
}

CardDetailsComponent.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
};

CardDetailsComponent.defaultProps = {
  disabled: false,
};

export default injectIntl(CardDetailsComponent);
