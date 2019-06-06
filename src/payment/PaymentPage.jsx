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

  renderBasket() {
    return (
      <React.Fragment>
        <ul>
          <li>showVoucherForm: {JSON.stringify(this.props.showVoucherForm)}</li>
          <li>paymentProviders: {JSON.stringify(this.props.paymentProviders)}</li>
          <li>orderTotal: {this.props.orderTotal}</li>
          <li>lineDiscount: {this.props.lineDiscount}</li>
          <li>sdnCheck: {JSON.stringify(this.props.sdnCheck)}</li>
          <li>lineTotal: {this.props.lineTotal}</li>
          <li>products: {JSON.stringify(this.props.products)}</li>
          <li>voucher: {JSON.stringify(this.props.voucher)}</li>
        </ul>
      </React.Fragment>
    );
  }

  render() {
    const {
      loading,
      loadingError,
      orderTotal,
    } = this.props;
    const loaded = !loading && !loadingError;
    const basketHasItems = orderTotal;

    return (
      <div className="page__payment container-fluid py-5">
        <h1>{this.props.intl.formatMessage(messages['payment.page.heading'])}</h1>

        {loadingError ? this.renderError() : null}
        {loading ? this.renderLoading() : null}
        {loaded ? (
          <div className="row">
            <div className="col-6">
              {basketHasItems ? this.renderBasket() : this.renderEmptyMessage()}
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
  loadingError: PropTypes.string,
  fetchBasket: PropTypes.func.isRequired,
  showVoucherForm: PropTypes.bool,
  paymentProviders: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(['cybersource', 'paypal']),
  })),
  orderTotal: PropTypes.number,
  lineDiscount: PropTypes.number,
  sdnCheck: PropTypes.bool,
  lineTotal: PropTypes.number,
  products: PropTypes.arrayOf(PropTypes.shape({
    imgUrl: PropTypes.string,
    name: PropTypes.string,
    seatType: PropTypes.string, // TODO: use PropTypes.oneOf([ all, kinds, of, certs ])
  })),
  voucher: PropTypes.shape({
    benefit: PropTypes.shape({
      type: PropTypes.string, // TODO: use PropTypes.oneOf(['Percentage', or other values]),
      value: PropTypes.number,
    }),
    code: PropTypes.string,
  }),
};

PaymentPage.defaultProps = {
  loadingError: null,
  loading: false,
  showVoucherForm: false,
  paymentProviders: undefined,
  orderTotal: undefined,
  lineDiscount: undefined,
  sdnCheck: false,
  lineTotal: undefined,
  products: undefined,
  voucher: undefined,
};


export default connect(paymentSelector, {
  fetchBasket,
})(injectIntl(PaymentPage));
