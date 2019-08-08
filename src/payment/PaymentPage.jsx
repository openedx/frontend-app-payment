import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-i18n';
import { Hyperlink } from '@edx/paragon';

import messages from './PaymentPage.messages';

// Actions
import { fetchBasket, submitPayment } from './data/actions';

// Selectors
import { paymentSelector } from './data/selectors';

// Components
import { PageLoading } from '../common';
import OrderSummary from './order-summary';
import OrderDetails from './order-details';
import PaymentForm from './PaymentForm';
import PlaceOrderButton from './PlaceOrderButton';
import PaymentMethodSelect from './PaymentMethodSelect';
import CartSummary from './CartSummary';
import AlertList from '../feedback/AlertList';
import { SingleEnrollmentCodeWarning, EnrollmentCodeQuantityUpdated } from './AlertCodeMessages';
import SummarySkeleton from './SummarySkeleton';

class PaymentPage extends React.Component {
  componentDidMount() {
    this.props.fetchBasket();
  }

  renderEmptyMessage() {
    const { dashboardURL, supportURL } = this.props;

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

  /**
   * If we're going to be redirecting to another page instead of showing the user the interface,
   * show a minimal spinner while the redirect is happening.  In other cases we want to show the
   * page skeleton, but in this case that would be misleading.
   */
  renderRedirectSpinner() {
    return (
      <PageLoading srMessage={this.props.intl.formatMessage(messages['payment.loading.payment'])} />
    );
  }

  /**
   * We show the basket view for all cases except: 1) an empty basket, and 2) when we're going to
   * perform a redirect.  That means that sometimes it's used during loading, in which case it shows
   * a "skeleton" view of the left-hand side of the interface until the actual content arrives.
   */
  renderBasket() {
    const {
      isFreeBasket,
      loading,
      isBasketProcessing,
    } = this.props;

    return (
      <div className="row">
        <h1 className="sr-only">
          <FormattedMessage
            id="payment.page.heading"
            defaultMessage="Payment"
            description="The screenreader-only page heading"
          />
        </h1>
        <section
          className="col-md-5 pr-md-5 col-basket-summary"
          aria-live="polite"
          aria-relevant="all"
          aria-label={this.props.intl.formatMessage(messages['payment.section.cart.label'])}
        >
          {loading ? (
            <SummarySkeleton />
          ) : (
            <div>
              <span className="sr-only">
                <FormattedMessage
                  id="payment.screen.reader.cart.details.loaded"
                  defaultMessage="Shopping cart details are loaded."
                  description="Screen reader text to be read when cart details load."
                />
              </span>
              <CartSummary />
              <OrderSummary />
              <OrderDetails />
            </div>
          )}
        </section>
        <section
          aria-label={this.props.intl.formatMessage(messages['payment.section.payment.details.label'])}
          className="col-md-7 pl-md-5"
        >
          {isFreeBasket ? (
            <PlaceOrderButton />
          ) : (
            <React.Fragment>
              <PaymentMethodSelect
                submitPayment={this.props.submitPayment}
                submitPaymentSuccess={this.props.submitPaymentSuccess}
                submitPaymentFulfill={this.props.submitPaymentFulfill}
                loading={loading}
                isBasketProcessing={isBasketProcessing}
              />
              <PaymentForm />
            </React.Fragment>
          )}
        </section>
      </div>
    );
  }

  renderContent() {
    const { isEmpty, isRedirect } = this.props;

    if (isRedirect) {
      return this.renderRedirectSpinner();
    }

    if (isEmpty) {
      return this.renderEmptyMessage();
    }

    // In all other cases, we want to render the basket content.  This is used before we've loaded
    // anything, during loading, and after we've loaded a basket with a product in it.
    return this.renderBasket();
  }

  render() {
    const { summaryQuantity, summarySubtotal } = this.props;

    return (
      <div className="page__payment container-fluid py-5">
        <AlertList
          /*
            For complex messages, the server will return a message code instead of a user message
            string. The values in the messageCodes object below will handle these messages. They can
            be a class/function, JSX element, or string. Class/functions and jsx elements will
            receive a 'values' prop of relevant data about the message. Strings will be rendered
            as-is.
          */
          messageCodes={{
            'single-enrollment-code-warning': SingleEnrollmentCodeWarning,
            'quantity-update-success-message': (
              <EnrollmentCodeQuantityUpdated
                values={{
                  quantity: summaryQuantity,
                  price: summarySubtotal,
                }}
              />
            ),
          }}
        />
        {this.renderContent()}
      </div>
    );
  }
}

PaymentPage.propTypes = {
  intl: intlShape.isRequired,
  isFreeBasket: PropTypes.bool,
  isEmpty: PropTypes.bool,
  isRedirect: PropTypes.bool,
  loading: PropTypes.bool,
  isBasketProcessing: PropTypes.bool,
  dashboardURL: PropTypes.string.isRequired,
  supportURL: PropTypes.string.isRequired,
  fetchBasket: PropTypes.func.isRequired,
  submitPayment: PropTypes.func.isRequired,
  submitPaymentSuccess: PropTypes.func.isRequired,
  submitPaymentFulfill: PropTypes.func.isRequired,
  summaryQuantity: PropTypes.number,
  summarySubtotal: PropTypes.number,
};

PaymentPage.defaultProps = {
  isFreeBasket: false,
  loading: false,
  isBasketProcessing: false,
  isEmpty: false,
  isRedirect: false,
  summaryQuantity: undefined,
  summarySubtotal: undefined,
};

export default connect(
  paymentSelector,
  {
    fetchBasket,
    submitPayment,
    submitPaymentSuccess: submitPayment.success,
    submitPaymentFulfill: submitPayment.fulfill,
  },
)(injectIntl(PaymentPage));
