import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-i18n';

import messages from './PaymentPage.messages';

// Actions
import { fetchBasket } from './actions';
import { paymentSelector } from './selectors';
import { PageLoading } from '../common';


class PaymentPage extends React.Component {
  componentDidMount() {
    this.props.fetchBasket();
  }

  renderEmptyMessage() {
    return (
      <p>
        {this.props.intl.formatMessage(messages['payment.empty.basket'])}
      </p>
    );
  }

  renderError() {
    return (
      <div>
        {this.props.intl.formatMessage(messages['payment.loading.error'], {
          error: this.props.loadingError,
        })}
      </div>
    );
  }

  renderLoading() {
    return (
      <PageLoading srMessage={this.props.intl.formatMessage(messages['payment.loading.payment'])} />
    );
  }

  render() {
    const {
      loading,
      loadingError,
      payment,
    } = this.props;
    const loaded = !loading && !loadingError;
    const hasPayments = payment.total;

    return (
      <div className="page__payment container-fluid py-5">
        <h1>
          {this.props.intl.formatMessage(messages['payment.page.heading'])}
        </h1>
        {loadingError ? this.renderError() : null}
        {loaded && hasPayments ? (
          <React.Fragment>
            <h2>Total</h2>
            <p>{this.props.payment.total}</p>
          </React.Fragment>
        ) : null}
        {loaded && !hasPayments ? this.renderEmptyMessage() : null}
        {loading ? this.renderLoading() : null}
      </div>
    );
  }
}


PaymentPage.propTypes = {
  intl: intlShape.isRequired,
  payment: PropTypes.shape({
    total: PropTypes.number,
  }),
  loading: PropTypes.bool,
  loadingError: PropTypes.string,
  fetchBasket: PropTypes.func.isRequired,
};

PaymentPage.defaultProps = {
  payment: {},
  loadingError: null,
  loading: false,
};


export default connect(paymentSelector, {
  fetchBasket,
})(injectIntl(PaymentPage));
