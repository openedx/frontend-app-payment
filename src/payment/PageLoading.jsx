import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { logInfo } from '@edx/frontend-platform/logging';

export default class PageLoading extends Component {
  renderSrMessage() {
    if (!this.props.srMessage) {
      return null;
    }

    return (
      <span className="sr-only">
        {this.props.srMessage}
      </span>
    );
  }

  render() {
    const { shouldRedirectToReceipt, orderNumber } = this.props;

    if (shouldRedirectToReceipt) {
      logInfo(`Dynamic Payment Methods payment succeeded for edX order number ${orderNumber}, redirecting to ecommerce receipt page.`);
      const queryParams = `order_number=${orderNumber}&disable_back_button=${Number(true)}&dpm_enabled=${true}`;
      if (getConfig().ENVIRONMENT !== 'test') {
        /* istanbul ignore next */
        global.location.assign(`${getConfig().ECOMMERCE_BASE_URL}/checkout/receipt/?${queryParams}`);
      }
    }

    return (
      <div>
        <div
          className="d-flex justify-content-center align-items-center flex-column"
          style={{
            height: '50vh',
          }}
        >
          <div className="spinner-border text-primary" data-testid="loading-page" role="status">
            {this.renderSrMessage()}
          </div>
        </div>
      </div>
    );
  }
}

PageLoading.propTypes = {
  srMessage: PropTypes.string.isRequired,
  shouldRedirectToReceipt: PropTypes.bool,
  orderNumber: PropTypes.string,
};

PageLoading.defaultProps = {
  shouldRedirectToReceipt: false,
  orderNumber: null,
};
