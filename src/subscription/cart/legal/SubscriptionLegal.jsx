import React from 'react';
import PropTypes from 'prop-types';
import { Hyperlink } from '@edx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

const SubscriptionLegal = ({
  programTitle,
  price,
}) => {
  const intl = useIntl();
  const supportLink = (
    <Hyperlink
      destination="https://support.edx.org/hc/en-us/sections/115004173027-Receive-and-Share-edX-Certificates"
    >
      {intl.formatMessage(messages['subscription.cart.order.legal.link'])}
    </Hyperlink>
  );
  return (
    <p className="micro text-gray-500">{intl.formatMessage(messages['subscription.cart.order.legal'], {
      price: intl.formatNumber(price, { style: 'currency', currency: 'USD' }),
      programTitle,
      supportLink,
    })}
    </p>
  );
};

SubscriptionLegal.propTypes = {
  programTitle: PropTypes.string,
  price: PropTypes.number,
};

SubscriptionLegal.defaultProps = {
  programTitle: 'Blockchain Fundamentals',
  price: 15.99,
};

export default SubscriptionLegal;
