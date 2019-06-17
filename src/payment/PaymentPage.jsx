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
import PaymentForm from './PaymentForm';
import ProductLineItems from './ProductLineItems';

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
        <ProductLineItems />
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
        {loadingError ? this.renderError() : null}
        {loading ? this.renderLoading() : null}
        {loaded ? (
          <div className="row">
            <div className="col-md-5 pr-md-5 col-basket-summary">
              {isEmpty ? this.renderBasket() : this.renderEmptyMessage()}
            </div>
            <div className="col-md-7 pl-md-5">
              <PaymentForm />
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
};

PaymentPage.defaultProps = {
  loadingError: null,
  loading: false,
  loaded: false,
  isEmpty: false,
};


export default connect(paymentSelector, {
  fetchBasket,
})(injectIntl(PaymentPage));
