import React from 'react';
import PropTypes from 'prop-types';
import { Hyperlink } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { getPropsToRemoveFractionZeroDigits } from '../../../payment/data/utils';

const SubscriptionLegal = ({
  programTitle,
  price,
  currency,
}) => {
  const intl = useIntl();
  const supportLink = (
    <Hyperlink
      destination={getConfig().LEARNER_SUPPORT_URL}
    >
      {intl.formatMessage(messages['subscription.details.order.legal.link'])}
    </Hyperlink>
  );
  return (
    <p>{intl.formatMessage(messages['subscription.details.order.legal'], {
      price: intl.formatNumber(price, {
        style: 'currency',
        currency,
        ...getPropsToRemoveFractionZeroDigits({ price, shouldRemoveFractionZeroDigits: true }),
      }),
      programTitle,
      supportLink,
      currency: currency || 'USD',
    })}
    </p>
  );
};

SubscriptionLegal.propTypes = {
  programTitle: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  currency: PropTypes.string,
};

SubscriptionLegal.defaultProps = {
  currency: 'USD',
};

export default SubscriptionLegal;
