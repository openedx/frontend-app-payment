import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-i18n';

import FormInput from './FormInput';
import FormSelect from './FormSelect';
import getStates from './utils/countryStatesMap';
import messages from './StateProvinceFormInput.messages';

class StateProvinceFormInput extends React.Component {
  getOptions() {
    const options = [];
    const { country } = this.props;
    const states = getStates(country);

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

  renderField(options, disabled, id) {
    if (options.length) {
      return (
        <React.Fragment>
          <Field
            id={id}
            name="state"
            component={FormSelect}
            options={options}
            required
            disabled={disabled}
          />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Field id="state" name="state" component={FormInput} type="text" disabled={disabled} />
      </React.Fragment>
    );
  }

  renderLabel(isRequired) {
    const { isPaymentVisualExperiment } = this.props;

    if (isRequired) {
      const requiredLabel = isPaymentVisualExperiment ? '' : '(required)';

      return (
        <label htmlFor="state">
          <FormattedMessage
            id="payment.card.holder.information.state.label"
            defaultMessage="State/Province {requiredLabel}"
            values={{ requiredLabel }}
            description="The label for the required card holder state/province field"
          />
        </label>
      );
    }

    const optionalLabel = isPaymentVisualExperiment ? '(optional)' : '';

    return (
      <label htmlFor="state">
        <FormattedMessage
          id="payment.card.holder.information.state.required.label"
          defaultMessage="State/Province {optionalLabel}"
          values={{ optionalLabel }}
          description="The label for the card holder state/province field"
        />
      </label>
    );
  }

  render() {
    const { disabled, id } = this.props;
    const options = this.getOptions();
    return (
      <React.Fragment>
        {this.renderLabel(options.length > 0)}
        {this.renderField(options, disabled, id)}
      </React.Fragment>
    );
  }
}

StateProvinceFormInput.propTypes = {
  id: PropTypes.string.isRequired,
  country: PropTypes.string,
  intl: intlShape.isRequired,
  disabled: PropTypes.bool.isRequired,
  isPaymentVisualExperiment: PropTypes.bool,
};

StateProvinceFormInput.defaultProps = {
  country: null,
  isPaymentVisualExperiment: false,
};

export default connect()(injectIntl(StateProvinceFormInput));
