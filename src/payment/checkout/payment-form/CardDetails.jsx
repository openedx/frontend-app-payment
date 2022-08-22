import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './CardDetails.messages';

import FormSelect from './FormSelect';
import FlexMicroform from './flex-microform/FlexMicroform';

import { updateCaptureKeySelector } from '../../data/selectors';

export class CardDetailsComponent extends React.Component {
  getNumericOptions(start, end) {
    const items = [];
    for (let i = start; i <= end; i += 1) {
      items.push(<option key={i} value={i}>{i}</option>);
    }
    return items;
  }

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
    const loading = this.props.captureKeyId === null;

    return (
      <div className="basket-section">
        <h5 aria-level="2">
          <FormattedMessage
            id="payment.card.details.billing.information.heading"
            defaultMessage="Billing Information"
            description="The heading for the credit card details billing information form"
          />
        </h5>

        <FlexMicroform captureKeyId={this.props.captureKeyId} disabled={disabled} />

        <div className="row">
          <div className="col-lg-6 form-group">
            <label htmlFor="cardExpirationMonth">
              <FormattedMessage
                id="payment.card.details.expiration.month.label"
                defaultMessage="Expiration Month (required)"
                description="The label for the required credit card expiration month field"
              />
            </label>
            <div data-hj-suppress>
              {loading && <div className="skeleton py-3" />}
              {!loading && (
                <Field
                  id="cardExpirationMonth"
                  name="cardExpirationMonth"
                  component={FormSelect}
                  options={this.renderExpirationMonthOptions()}
                  required
                  disabled={disabled}
                  autoComplete="cc-exp-month"
                />
              )}
            </div>
          </div>
          <div className="col-lg-6 form-group">
            <label htmlFor="cardExpirationYear">
              <FormattedMessage
                id="payment.card.details.expiration.year.label"
                defaultMessage="Expiration Year (required)"
                description="The label for the required credit card expiration year field"
              />
            </label>
            <div data-hj-suppress>
              {loading && <div className="skeleton py-3" />}
              {!loading && (
                <Field
                  id="cardExpirationYear"
                  name="cardExpirationYear"
                  component={FormSelect}
                  options={this.renderExpirationYearOptions()}
                  required
                  disabled={disabled}
                  autoComplete="cc-exp-year"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

CardDetailsComponent.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  captureKeyId: PropTypes.string,
};

CardDetailsComponent.defaultProps = {
  disabled: false,
  captureKeyId: null,
};

export default connect(updateCaptureKeySelector)(injectIntl(CardDetailsComponent));
