import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-i18n';

import messages from './messages';
import { PERCENTAGE_BENEFIT, ABSOLUTE_BENEFIT } from './data/constants';

const Benefit = (props) => {
  const {
    type, code, value, intl,
  } = props;

  let formattedValue = null;
  let formattedMessage = null;
  switch (type) {
    case PERCENTAGE_BENEFIT:
      formattedValue = intl.formatNumber(value / 100, {
        style: 'percent',
      });
      formattedMessage = intl.formatMessage(messages['payment.coupon.benefit.percentage'], {
        code,
        value: formattedValue,
      });
      break;
    case ABSOLUTE_BENEFIT:
      formattedValue = intl.formatNumber(value, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      });
      formattedMessage = intl.formatMessage(messages['payment.coupon.benefit.absolute'], {
        code,
        value: formattedValue,
      });
      break;
    default:
      // Creates a generic message for sanity, as it's possible the server might send up a type we
      // don't know about and it'd be better to display this message than to show nothing.
      formattedMessage = intl.formatMessage(messages['payment.coupon.benefit.default'], {
        code,
      });
  }

  return <span>{formattedMessage}</span>;
};

Benefit.propTypes = {
  code: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  type: PropTypes.oneOf([PERCENTAGE_BENEFIT, ABSOLUTE_BENEFIT]).isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(Benefit);
