import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { clearFields, Field } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-i18n';

import FormInput from '../../../common/components/FormInput';
import FormSelect from '../../../common/components/FormSelect';

import { countryOptionsSelector } from '../../data/selectors';
import messages from './CardHolderInformation.messages';
import StateProvinceFormInput from './StateProvinceFormInput';

export class CardHolderInformationComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = { selectedCountry: null };
  }

  handleSelectCountry = (event, newValue) => {
    this.setState({ selectedCountry: newValue });
    this.props.clearFields('payment', false, false, ['state']);
  };

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
    const { disabled, showBulkEnrollmentFields } = this.props;
    return (
      <div className="basket-section">
        <h5 aria-level="2">
          <FormattedMessage
            id="payment.card.holder.information.heading"
            defaultMessage="Card Holder Information"
            description="The heading for the credit card holder information form"
          />
        </h5>
        <div className="row">
          <div className="col-lg-6 form-group">
            <label htmlFor="firstName">
              <FormattedMessage
                id="payment.card.holder.information.first.name.label"
                defaultMessage="First Name (required)"
                description="The label for the required card holder first name field"
              />
            </label>
            <Field
              id="firstName"
              name="firstName"
              component={FormInput}
              type="text"
              required
              disabled={disabled}
              autocomplete="given-name"
            />
          </div>
          <div className="col-lg-6 form-group">
            <label htmlFor="lastName">
              <FormattedMessage
                id="payment.card.holder.information.last.name.label"
                defaultMessage="Last Name (required)"
                description="The label for the required card holder last name field"
              />
            </label>
            <Field
              id="lastName"
              name="lastName"
              component={FormInput}
              type="text"
              required
              disabled={disabled}
              autocomplete="family-name"
            />
          </div>
        </div>

        { showBulkEnrollmentFields ? (
          <div className="row">
            <div className="col-lg-6 form-group">
              <label htmlFor="organization">
                <FormattedMessage
                  id="payment.card.holder.information.organization.label"
                  defaultMessage="Organization (required)"
                  description="The label for the required organization field"
                />
              </label>
              <Field
                id="organization"
                name="organization"
                component={FormInput}
                type="text"
                required
                disabled={disabled}
                autocomplete="organization"
              />
            </div>
          </div>
        ) : null}

        <div className="row">
          <div className="col-lg-6 form-group">
            <label htmlFor="address">
              <FormattedMessage
                id="payment.card.holder.information.address.label"
                defaultMessage="Address (required)"
                description="The label for the required card holder address field"
              />
            </label>
            <Field
              id="address"
              name="address"
              component={FormInput}
              type="text"
              required
              disabled={disabled}
              autocomplete="street-address"
            />
          </div>
          <div className="col-lg-6 form-group">
            <label htmlFor="unit">
              <FormattedMessage
                id="payment.card.holder.information.unit.label"
                defaultMessage="Suite/Apartment Number"
                description="The label for the card holder suite/apartment number field"
              />
            </label>
            <Field
              id="unit"
              name="unit"
              component={FormInput}
              type="text"
              disabled={disabled}
              autocomplete="address-line1"
            />
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
            <Field
              id="city"
              name="city"
              component={FormInput}
              type="text"
              required
              disabled={disabled}
              autocomplete="address-level2"
            />
          </div>
          <div className="col-lg-6 form-group">
            <label htmlFor="country">
              <FormattedMessage
                id="payment.card.holder.information.country.label"
                defaultMessage="Country (required)"
                description="The label for the required card holder country field"
              />
            </label>
            <Field
              id="country"
              name="country"
              component={FormSelect}
              options={this.renderCountryOptions()}
              required
              onChange={this.handleSelectCountry}
              disabled={disabled}
              autocomplete="country-name"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 form-group">
            <StateProvinceFormInput country={this.state.selectedCountry} disabled={disabled} id="state" autocomplete="address-level1" />
          </div>
          <div className="col-lg-6 form-group">
            <label htmlFor="postalCode">
              <FormattedMessage
                id="payment.card.holder.information.postal.code.label"
                defaultMessage="Zip/Postal Code"
                description="The label for the card holder zip/postal code field"
              />
            </label>
            <Field
              id="postalCode"
              name="postalCode"
              component={FormInput}
              type="text"
              disabled={disabled}
              autocomplete="postal-code"
            />
          </div>
        </div>
      </div>
    );
  }
}

CardHolderInformationComponent.propTypes = {
  clearFields: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  countryOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  })),
  disabled: PropTypes.bool,
  showBulkEnrollmentFields: PropTypes.bool,
};

CardHolderInformationComponent.defaultProps = {
  countryOptions: [],
  disabled: false,
  showBulkEnrollmentFields: false,
};

export default connect(
  countryOptionsSelector,
  { clearFields },
)(injectIntl(CardHolderInformationComponent));
