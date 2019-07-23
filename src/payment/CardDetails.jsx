import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import ReactTooltip from 'react-tooltip';
import { faLock, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { injectIntl, FormattedMessage } from '@edx/frontend-i18n';

import FormInput from '../common/components/FormInput';
import FormSelect from '../common/components/FormSelect';

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
              ariaLabel="card number"
              title="Card Number"
              component={FormInput}
              type="text"
              required
              disabled={submitting}
              onChange={this.handleCardNumberChange}
            />
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
              ariaLabel="security code"
              title="Security Code"
              component={FormInput}
              type="password"
              required
              disabled={submitting}
              onChange={this.handleSecurityCodeChange}
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
              ariaLabel="card expiration month"
              title="Card Expiration Month"
              component={FormSelect}
              options={this.renderExpirationMonthOptions()}
              required
              disabled={submitting}
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
              ariaLabel="card expiration year"
              title="Card Expiration Year"
              component={FormSelect}
              options={this.renderExpirationYearOptions()}
              required
              disabled={submitting}
            />
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
