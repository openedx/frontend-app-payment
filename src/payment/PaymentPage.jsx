import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { getConfig } from '@edx/frontend-platform';
import {
  FormattedMessage,
  getLocale,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import { logInfo } from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';
import { sendPageEvent } from '@edx/frontend-platform/analytics';

import messages from './PaymentPage.messages';
import { handleApiError } from './data/handleRequestError';

// Actions
import { fetchBasket } from './data/actions';

// Selectors
import { paymentSelector } from './data/selectors';

// Components
import PageLoading from './PageLoading';
import EmptyCartMessage from './EmptyCartMessage';
import Cart from './cart/Cart';
import Checkout from './checkout/Checkout';
import { FormattedAlertList } from '../components/formatted-alert-list/FormattedAlertList';

class PaymentPage extends React.Component {
  constructor(props) {
    super(props);

    const {
      experimentVariables: {
        isNumEnrolledExperiment = false,
        REV1045Experiment = false,
        isTransparentPricingExperiment = false,
        enrollmentCountData = [],
      } = {},
    } = window;

    this.state = {
      isNumEnrolledExperiment,
      REV1045Experiment,
      isTransparentPricingExperiment,
      enrollmentCountData,
      stripe: null,
      paymentStatus: null, // only available when redirected back to payment.edx.org from dynamic payment methods
      orderNumber: null, // order number associated with the Payment Intent from dynamic payment methods
    };
  }

  componentDidMount() {
    sendPageEvent();
    this.props.fetchBasket();
  }

  componentDidUpdate(prevProps) {
    const { enableStripePaymentProcessor } = this.props;
    if (!prevProps.enableStripePaymentProcessor && enableStripePaymentProcessor) {
      this.initializeStripe();
    }
  }

  initializeStripe = async () => {
    const stripePromise = await loadStripe(process.env.STRIPE_PUBLISHABLE_KEY, {
      betas: [process.env.STRIPE_BETA_FLAG],
      apiVersion: process.env.STRIPE_API_VERSION,
      locale: getLocale(),
    });
    this.setState({ stripe: stripePromise }, () => {
      this.retrievePaymentIntentInfo();
    });
  };

  retrievePaymentIntentInfo = async () => {
    // Get Payment Intent to retrieve the payment status and order number associated with this DPM payment.
    // If this is not a Stripe dynamic payment methods (BNPL), URL will not contain any params
    // and should not retrieve the Payment Intent.
    const searchParams = new URLSearchParams(global.location.search);
    const clientSecretId = searchParams.get('payment_intent_client_secret');
    if (clientSecretId) {
      const { paymentIntent, error } = await this.state.stripe.retrievePaymentIntent(clientSecretId);
      if (error) { handleApiError(error); }
      this.setState({ orderNumber: paymentIntent.description });
      this.setState({ paymentStatus: paymentIntent.status });
    }
  };

  redirectToReceiptPage(orderNumber) {
    logInfo(`Payment succeeded for edX order number ${orderNumber}, redirecting to ecommerce receipt page.`);
    const queryParams = `order_number=${orderNumber}&disable_back_button=${Number(true)}&dpm_enabled=${true}`;
    if (getConfig().ENVIRONMENT !== 'test') {
      /* istanbul ignore next */
      global.location.assign(`${getConfig().ECOMMERCE_BASE_URL}/checkout/receipt/?${queryParams}`);
    }
  }

  renderContent() {
    const { isEmpty, isRedirect, isPaymentRedirect } = this.props;

    const {
      isNumEnrolledExperiment,
      REV1045Experiment,
      isTransparentPricingExperiment,
      enrollmentCountData,
      paymentStatus,
      stripe,
      orderNumber,
    } = this.state;

    // If this is a redirect from Stripe Dynamic Payment Methods with a successful payment, redirect to the receipt page
    if (paymentStatus === 'succeeded') {
      this.redirectToReceiptPage(orderNumber);
    }

    // If this is a redirect from Stripe Dynamic Payment Methods, show loading icon until getPaymentStatus is done.
    if (isPaymentRedirect && (paymentStatus !== 'requires_payment_method' || paymentStatus !== 'canceled')) {
      return (
        <PageLoading
          srMessage={this.props.intl.formatMessage(messages['payment.loading.payment'])}
        />
      );
    }

    // If we're going to be redirecting to another page instead of showing the user the interface,
    // show a minimal spinner while the redirect is happening.  In other cases we want to show the
    // page skeleton, but in this case that would be misleading.
    if (isRedirect) {
      return (
        <PageLoading
          srMessage={this.props.intl.formatMessage(messages['payment.loading.payment'])}
        />
      );
    }

    if (isEmpty) {
      return (
        <EmptyCartMessage />
      );
    }

    // In all other cases, we want to render the basket content.  This is used before we've loaded
    // anything, during loading, and after we've loaded a basket with a product in it.

    // We show the page content view for all cases except:
    //   1) an empty basket, and
    //   2) when we're going to perform a redirect.
    // That means that sometimes it's used during loading, in which case it shows a "skeleton"
    // view of the left-hand side of the interface until the actual content arrives.
    return (
      <div className="row">
        <h1 className="sr-only">
          <FormattedMessage
            id="payment.heading.page"
            defaultMessage="Payment"
            description="The screenreader-only page heading"
          />
        </h1>
        <div className="col-md-5 pr-md-5 col-basket-summary">
          <Cart
            isNumEnrolledExperiment={isNumEnrolledExperiment}
            REV1045Experiment={REV1045Experiment}
            isTransparentPricingExperiment={isTransparentPricingExperiment}
            enrollmentCountData={enrollmentCountData}
          />
        </div>
        <div className="col-md-7 pl-md-5">
          { stripe ? <Checkout stripe={stripe} /> : <Checkout />}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="page__payment container-fluid py-5">
        <FormattedAlertList
          summaryQuantity={this.props.summaryQuantity}
          summarySubtotal={this.props.summarySubtotal}
        />
        {this.renderContent()}
      </div>
    );
  }
}

PaymentPage.contextType = AppContext;

PaymentPage.propTypes = {
  intl: intlShape.isRequired,
  isEmpty: PropTypes.bool,
  isRedirect: PropTypes.bool,
  isPaymentRedirect: PropTypes.bool,
  enableStripePaymentProcessor: PropTypes.bool,
  fetchBasket: PropTypes.func.isRequired,
  summaryQuantity: PropTypes.number,
  summarySubtotal: PropTypes.number,
};

PaymentPage.defaultProps = {
  isEmpty: false,
  isRedirect: false,
  isPaymentRedirect: false,
  enableStripePaymentProcessor: false,
  summaryQuantity: undefined,
  summarySubtotal: undefined,
};

const mapStateToProps = (state) => ({
  ...paymentSelector(state),
});

export default connect(mapStateToProps, { fetchBasket })(injectIntl(PaymentPage));
