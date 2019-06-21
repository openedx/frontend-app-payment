import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-i18n';

import FormInput from '../common/components/FormInput';
import FormSelect from '../common/components/FormSelect';
import getStates from './data/countryStatesMap';
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

  renderField(options) {
    if (options.length) {
      return (
        <React.Fragment>
          <Field id="state" name="state" component={FormSelect} options={options} required />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Field id="state" name="state" component={FormInput} type="text" />
      </React.Fragment>
    );
  }

  renderLabel(isRequired) {
    if (isRequired) {
      return (
        <label htmlFor="country">
          <FormattedMessage
            id="payment.card.holder.information.state.label"
            defaultMessage="State/Province (required)"
            description="The label for the required card holder state/province field"
          />
        </label>
      );
    }

    return (
      <label htmlFor="country">
        <FormattedMessage
          id="payment.card.holder.information.state.required.label"
          defaultMessage="State/Province"
          description="The label for the card holder state/province field"
        />
      </label>
    );
  }

  render() {
    const options = this.getOptions();
    return (
      <React.Fragment>
        {this.renderLabel(options.length > 0)}
        {this.renderField(options)}
      </React.Fragment>
    );
  }
}

StateProvinceFormInput.propTypes = {
  country: PropTypes.string,
  intl: intlShape.isRequired,
};

StateProvinceFormInput.defaultProps = {
  country: null,
};

export default connect()(injectIntl(StateProvinceFormInput));
