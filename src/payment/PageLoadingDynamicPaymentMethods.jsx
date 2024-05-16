import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { logInfo } from '@edx/frontend-platform/logging';

const PageLoadingDynamicPaymentMethods = ({ srMessage, orderNumber }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      logInfo(`Dynamic Payment Methods payment succeeded for edX order number ${orderNumber}, redirecting to ecommerce receipt page.`);
      const queryParams = `order_number=${orderNumber}&disable_back_button=${Number(true)}&dpm_enabled=${true}`;

      if (getConfig().ENVIRONMENT !== 'test') {
        /* istanbul ignore next */
        global.location.assign(`${getConfig().ECOMMERCE_BASE_URL}/checkout/receipt/?${queryParams}`);
      }
    }, 3000); // Delay the redirect to receipt page by 3 seconds to make sure ecomm order fulfillment is done.

    return () => clearTimeout(timer); // On unmount, clear the timer
  }, [srMessage, orderNumber]);

  const renderSrMessage = () => {
    if (!srMessage) {
      return null;
    }

    return (
      <span className="sr-only">
        {srMessage}
      </span>
    );
  };

  return (
    <div>
      <div
        className="d-flex justify-content-center align-items-center flex-column"
        style={{
          height: '50vh',
        }}
      >
        <div className="spinner-border text-primary" data-testid="loading-page" role="status">
          {renderSrMessage()}
        </div>
      </div>
    </div>
  );
};

PageLoadingDynamicPaymentMethods.propTypes = {
  srMessage: PropTypes.string.isRequired,
  orderNumber: PropTypes.string,
};

PageLoadingDynamicPaymentMethods.defaultProps = {
  orderNumber: null,
};

export default PageLoadingDynamicPaymentMethods;
