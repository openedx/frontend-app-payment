import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';

import { getCountryStatesMap } from './utils/form-validators';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import messages from './StateProvinceFormInput.messages';

class StateProvinceFormInput extends React.Component {
  getOptions() {
    const options = [];
    const { country } = this.props;
    const states = getCountryStatesMap(country);

    if (states) {
      options.push([(
        <option key="" value="">
          {this.props.intl.formatMessage(messages['payment.card.holder.information.state.options.empty'])}
        </option>
      )]);

      Object.keys(states).forEach((key) => {
        options.push(<option key={key} value={key}>{states[key]}</option>);
      });
    }

    return options;
  }

  renderField(options, disabled, id, otherProps) {
    if (options.length) {
      return (
        <Field
          id={id}
          name="state"
          component={FormSelect}
          options={options}
          required
          disabled={disabled}
        />
      );
    }

    return (
      <Field id="state" name="state" component={FormInput} type="text" disabled={disabled} props={otherProps} />
    );
  }

  renderLabel(isRequired) {
    if (isRequired) {
      return (
        <label htmlFor="state">
          <FormattedMessage
            id="payment.card.holder.information.state.label"
            defaultMessage="State/Province (required)"
            description="The label for the required card holder state/province field"
          />
        </label>
      );
    }

    return (
      <label htmlFor="state">
        <FormattedMessage
          id="payment.card.holder.information.state.required.label"
          defaultMessage="State/Province"
          description="The label for the card holder state/province field"
        />
      </label>
    );
  }

  render() {
    const {
      disabled,
      id,
      country,
      ...otherProps
    } = this.props;
    const options = this.getOptions();
    return (
      <>
        {this.renderLabel(options.length > 0)}
        {this.renderField(options, disabled, id, otherProps)}
      </>
    );
  }
}

StateProvinceFormInput.propTypes = {
  id: PropTypes.string.isRequired,
  country: PropTypes.string,
  intl: intlShape.isRequired,
  disabled: PropTypes.bool.isRequired,
};

StateProvinceFormInput.defaultProps = {
  country: null,
};

export default injectIntl(StateProvinceFormInput);
