import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import {
  faCcAmex,
  faCcDiscover,
  faCcMastercard,
  faCcVisa,
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { injectIntl, FormattedMessage } from '@edx/frontend-i18n';

const CardValidator = require('card-validator');

const CardIcons = {
  'american-express': faCcAmex,
  discover: faCcDiscover,
  mastercard: faCcMastercard,
  visa: faCcVisa,
};

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

  updateCardType = (event, newValue) => {
    let cardIcon = null;
    const { card } = CardValidator.number(newValue);
    if (card) {
      cardIcon = CardIcons[card.type];
    }
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
              component="input"
              type="password"
              required
              className="form-control"
              onChange={this.updateCardType}
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
            <Field id="securityCode" name="securityCode" component="input" type="password" required className="form-control" />
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
            <Field id="cardExpirationMonth" name="cardExpirationMonth" component="select" required className="form-control">
              {this.renderExpirationMonthOptions()}
            </Field>
          </div>
          <div className="col-lg-6 form-group">
            <label htmlFor="cardExpirationYear">
              <FormattedMessage
                id="payment.card.details.expiration.year.label"
                defaultMessage="Expiration Year (required)"
                description="The label for the required credit card expiration year field"
              />
            </label>
            <Field id="cardExpirationYear" name="cardExpirationYear" component="select" required className="form-control">
              {this.renderExpirationYearOptions()}
            </Field>
          </div>
        </div>
      </div>
    );
  }
}

export default connect()(injectIntl(CardDetailsComponent));
