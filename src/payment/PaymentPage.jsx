import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import messages from './PaymentPage.messages';

// Actions
import { fetchBasket } from './data/actions';

// Selectors
import { paymentSelector } from './data/selectors';

// Components
import PageLoading from './PageLoading';
import AlertList from '../feedback/AlertList';
import { SingleEnrollmentCodeWarning, EnrollmentCodeQuantityUpdated, TransactionDeclined } from './AlertCodeMessages';
import EmptyCartMessage from './EmptyCartMessage';
import Cart from './cart/Cart';
import Checkout from './checkout/Checkout';

class PaymentPage extends React.Component {
  constructor(props) {
    super(props);

    const {
      experimentVariables: {
        isPaymentVisualExperiment = false,
        isNumEnrolledExperiment = false,
        REV1045Experiment = false,
        isPriceMessageExperiment = false,
        enrollmentCountData = [],
      } = {},
    } = window;

    this.state = {
      isPaymentVisualExperiment,
      isNumEnrolledExperiment,
      REV1045Experiment,
      isPriceMessageExperiment,
      enrollmentCountData,
    };
  }

  componentDidMount() {
    this.props.fetchBasket();
  }

  renderContent() {
    const { isEmpty, isRedirect } = this.props;
    const {
      isPaymentVisualExperiment,
      isNumEnrolledExperiment,
      REV1045Experiment,
      isPriceMessageExperiment,
      enrollmentCountData,
    } = this.state;

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
            id="payment.page.heading"
            defaultMessage="Payment"
            description="The screenreader-only page heading"
          />
        </h1>
        <div className="col-md-5 pr-md-5 col-basket-summary">
          <Cart
            isPaymentVisualExperiment={isPaymentVisualExperiment}
            isNumEnrolledExperiment={isNumEnrolledExperiment}
            REV1045Experiment={REV1045Experiment}
            isPriceMessageExperiment={isPriceMessageExperiment}
            enrollmentCountData={enrollmentCountData}
          />
        </div>
        <div className="col-md-7 pl-md-5">
          <Checkout isPaymentVisualExperiment={isPaymentVisualExperiment} />
        </div>
      </div>
    );
  }

  render() {
    const {
      summaryQuantity, summarySubtotal, intl,
    } = this.props;

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
            'transaction-declined-message': (
              <TransactionDeclined />
            ),
            'apple-pay-merchant-validation-failure': intl.formatMessage(messages['payment.apple.pay.merchant.validation.failure']),
            'apple-pay-authorization-failure': intl.formatMessage(messages['payment.apple.pay.authorization.failure']),
          }}
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
  fetchBasket: PropTypes.func.isRequired,
  summaryQuantity: PropTypes.number,
  summarySubtotal: PropTypes.number,
};

PaymentPage.defaultProps = {
  isEmpty: false,
  isRedirect: false,
  summaryQuantity: undefined,
  summarySubtotal: undefined,
};

export default connect(
  paymentSelector,
  {
    fetchBasket,
  },
)(injectIntl(PaymentPage));
