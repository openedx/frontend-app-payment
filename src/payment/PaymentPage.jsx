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
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{this.props.intl.formatMessage(messages['payment.empty.basket'])}</h5>
          <p className="card-text">If you attempted to make a purchase, you have not been charged. Return to your <a href="https://courses.edx.org/dashboard">dashboard</a> to try again, or <a href="https://courses.edx.org/support/contact_us">contact edX E-commerce Support</a>.</p>
        </div>
      </div>
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
            { isEmpty ?
              <div className="col-md-5 pr-md-5 col-basket-summary">
                {this.renderBasket()}
              </div> :
              <div>
                {this.renderEmptyMessage()}
              </div>
            }
            <div className="col-md-7 pl-md-5">
              {isEmpty ? <PaymentForm /> : null}
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
