import React from 'react';
import PropTypes from 'prop-types';
import { Hyperlink } from '@edx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

const SubscriptionLegal = ({
  programTitle,
  price,
  currency,
}) => {
  const intl = useIntl();
  const supportLink = (
    <Hyperlink
      destination="https://support.edx.org/hc/en-us/sections/115004173027-Receive-and-Share-edX-Certificates"
    >
      {intl.formatMessage(messages['subscription.details.order.legal.link'])}
    </Hyperlink>
  );
  return (
    <p className="micro">{intl.formatMessage(messages['subscription.details.order.legal'], {
      price: intl.formatNumber(price, { style: 'currency', currency }),
      programTitle,
      supportLink,
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
