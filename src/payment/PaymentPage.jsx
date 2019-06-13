import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-i18n';

import messages from './PaymentPage.messages';

// Actions
import { fetchBasket } from './data/actions';

// Selectors
import { paymentSelector } from './data/selectors';

// Components
import { PageLoading } from '../common';
import BasketSummary from './BasketSummary';
import OrderDetails from './OrderDetails';

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

  renderBasket() {
    return (
      <React.Fragment>
        <ul>
          <li>paymentProviders: {JSON.stringify(this.props.paymentProviders)}</li>
          <li>sdnCheck: {JSON.stringify(this.props.sdnCheck)}</li>
          <li>products: {JSON.stringify(this.props.products)}</li>
        </ul>
        <BasketSummary />
        <OrderDetails />
      </React.Fragment>
    );
  }

  render() {
    const {
      loading,
      loaded,
      loadingError,
      isEmpty,
    } = this.props;

    return (
      <div className="page__payment container-fluid py-5">
        <h1>{this.props.intl.formatMessage(messages['payment.page.heading'])}</h1>

        {loadingError ? this.renderError() : null}
        {loading ? this.renderLoading() : null}
        {loaded ? (
          <div className="row">
            <div className="col-6">
              {isEmpty ? this.renderBasket() : this.renderEmptyMessage()}
            </div>
            <div className="col-6">
              {/* Payment form */}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}


PaymentPage.propTypes = {
  intl: intlShape.isRequired,
  loading: PropTypes.bool,
  loaded: PropTypes.bool,
  loadingError: PropTypes.string,
  isEmpty: PropTypes.bool,
  fetchBasket: PropTypes.func.isRequired,
  paymentProviders: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(['cybersource', 'paypal']),
  })),
  sdnCheck: PropTypes.bool,
  products: PropTypes.arrayOf(PropTypes.shape({
    imgUrl: PropTypes.string,
    name: PropTypes.string,
    seatType: PropTypes.string, // TODO: use PropTypes.oneOf([ all, kinds, of, certs ])
  })),
};

PaymentPage.defaultProps = {
  loadingError: null,
  loading: false,
  loaded: false,
  isEmpty: false,
  paymentProviders: undefined,
  sdnCheck: false,
  products: undefined,
};


export default connect(paymentSelector, {
  fetchBasket,
})(injectIntl(PaymentPage));
