import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-i18n';
import { Hyperlink } from '@edx/paragon';

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
    const {
      dashboardURL,
      supportURL,
    } = this.props;

    return (
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">
            <FormattedMessage
              id="payment.empty.basket.heading"
              defaultMessage="Your basket is empty."
              description="The heading displayed when there is no basket"
            />
          </h5>
          <p className="card-text">
            <FormattedMessage
              id="payment.empty.basket.message"
              defaultMessage="If you attempted to make a purchase, you have not been charged. Return to your {actionLinkOne} to try again, or {actionLinkTwo}."
              description="The message displayed when there is no basket. Action links will redirect to dashboard or support page"
              values={{
              actionLinkOne: (
                <Hyperlink destination={dashboardURL}>
                  <FormattedMessage
                    id="payment.empty.basket.dashboardURL"
                    defaultMessage="dashboard"
                    description="The message displayed on the redirect to dashboard link"
                  />
                </Hyperlink>
              ),
              actionLinkTwo: (
                <Hyperlink destination={supportURL}>
                  <FormattedMessage
                    id="payment.empty.basket.supportURL"
                    defaultMessage="contact edX E-commerce Support"
                    description="The message displayed on the redirect to support page link"
                  />
                </Hyperlink>
              ),
            }}
            />
          </p>
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
      <div className="row">
        <div className="col-md-5 pr-md-5 col-basket-summary">
          <ProductLineItems />
          <BasketSummary />
          <OrderDetails />
        </div>
        <div className="col-md-7 pl-md-5">
          <PaymentForm />
        </div>
      </div>
    );
  }

  render() {
    const {
      loading,
      loadingError,
      isEmpty,
    } = this.props;

    return (
      <div className="page__payment container-fluid py-5">
        {loadingError ? this.renderError() : null}
        {loading ? this.renderLoading() : null}
        {isEmpty ? this.renderEmptyMessage() : this.renderBasket()}
      </div>
    );
  }
}


PaymentPage.propTypes = {
  intl: intlShape.isRequired,
  loading: PropTypes.bool,
  loadingError: PropTypes.string,
  isEmpty: PropTypes.bool,
  dashboardURL: PropTypes.string.isRequired,
  supportURL: PropTypes.string.isRequired,
  fetchBasket: PropTypes.func.isRequired,
};

PaymentPage.defaultProps = {
  loadingError: null,
  loading: false,
  isEmpty: false,
};


export default connect(paymentSelector, {
  fetchBasket,
})(injectIntl(PaymentPage));
