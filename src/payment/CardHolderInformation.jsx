import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-i18n';

import { countryOptionsSelector } from './data/selectors';
import messages from './CardHolderInformation.messages';

class CardHolderInformation extends React.Component {
  renderCountryOptions() {
    const items = [(
      <option key="" value="">
        {this.props.intl.formatMessage(messages['payment.card.holder.information.country.options.empty'])}
      </option>
    )];
    for (let i = 0; i < this.props.countryOptions.length; i += 1) {
      const { value, label } = this.props.countryOptions[i];
      items.push(<option key={value} value={value}>{label}</option>);
    }
    return items;
  }

  render() {
    return (
      <div className="container-fluid py-5">
        <h2 className="h6">
          <FormattedMessage
            id="payment.card.holder.information.heading"
            defaultMessage="Card Holder Information"
            description="The heading for the credit card holder information form"
          />
        </h2>

        <div className="row">
          <div className="col-lg-6 form-group">
            <label htmlFor="firstName">
              <FormattedMessage
                id="payment.card.holder.information.first.name.label"
                defaultMessage="First Name (required)"
                description="The label for the required card holder first name field"
              />
            </label>
            <Field name="firstName" component="input" type="text" required className="form-control" />
          </div>
          <div className="col-lg-6 form-group">
            <label htmlFor="lastName">
              <FormattedMessage
                id="payment.card.holder.information.last.name.label"
                defaultMessage="Last Name (required)"
                description="The label for the required card holder last name field"
              />
            </label>
            <Field name="lastName" component="input" type="text" required className="form-control" />
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 form-group">
            <label htmlFor="address">
              <FormattedMessage
                id="payment.card.holder.information.address.label"
                defaultMessage="Address (required)"
                description="The label for the required card holder address field"
              />
            </label>
            <Field name="address" component="input" type="text" required className="form-control" />
          </div>
          <div className="col-lg-6 form-group">
            <label htmlFor="unit">
              <FormattedMessage
                id="payment.card.holder.information.unit.label"
                defaultMessage="Suite/Apartment Number"
                description="The label for the card holder suite/apartment number field"
              />
            </label>
            <Field name="unit" component="input" type="text" required className="form-control" />
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 form-group">
            <label htmlFor="city">
              <FormattedMessage
                id="payment.card.holder.information.city.label"
                defaultMessage="City (required)"
                description="The label for the required card holder city field"
              />
            </label>
            <Field name="city" component="input" type="text" required className="form-control" />
          </div>
          <div className="col-lg-6 form-group">
            <label htmlFor="country">
              <FormattedMessage
                id="payment.card.holder.information.country.label"
                defaultMessage="Country (required)"
                description="The label for the required card holder country field"
              />
            </label>
            <Field name="country" component="select" required className="form-control">
              {this.renderCountryOptions()}
            </Field>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 form-group">
            <label htmlFor="state">
              <FormattedMessage
                id="payment.card.holder.information.state.label"
                defaultMessage="State/Province"
                description="The label for the card holder state/province field"
              />
            </label>
            <Field name="state" component="input" type="text" required className="form-control" />
          </div>
          <div className="col-lg-6 form-group">
            <label htmlFor="postalCode">
              <FormattedMessage
                id="payment.card.holder.information.postal.code.label"
                defaultMessage="Zip/Postal Code"
                description="The label for the card holder zip/postal code field"
              />
            </label>
            <Field name="postalCode" component="input" type="text" required className="form-control" />
          </div>
        </div>
      </div>
    );
  }
}

CardHolderInformation.propTypes = {
  intl: intlShape.isRequired,
  countryOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  })),
};

CardHolderInformation.defaultProps = {
  countryOptions: [],
};

export default connect(countryOptionsSelector)(injectIntl(CardHolderInformation));
