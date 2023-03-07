import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { sendPageEvent } from '@edx/frontend-platform/analytics';

import messages from '../payment/PaymentPage.messages';

// Actions
import { fetchBasket } from '../payment/data/actions';

// Selectors
import { paymentSelector } from '../payment/data/selectors';

// Components
import PageLoading from '../payment/PageLoading';
import EmptyCartMessage from '../payment/EmptyCartMessage';
import SubscriptionCart from './cart/SubscriptionCart';
import Checkout from '../payment/checkout/Checkout';
import { FormattedAlertList } from '../components/formatted-alert-list/FormattedAlertList';

/**
 * Subscription Page
 * This page will be responsible to handle all the new
 * program subscription checkout requests
 */
export class SubscriptionPage extends React.Component {
  componentDidMount() {
    sendPageEvent();
    this.props.fetchBasket();
  }

  renderContent() {
    const { isEmpty, isRedirect } = this.props;
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
      <div className="row subscription-page">
        <h1 className="sr-only">
          <FormattedMessage
            id="subscription.screen.heading.page"
            defaultMessage="Payment"
            description="The screenreader-only page heading"
          />
        </h1>
        <div className="col-md-5 pr-lg-5 col-basket-summary">
          <SubscriptionCart />
        </div>
        <div className="col-md-7 pl-lg-5 checkout-wrapper">
          <Checkout isSubscription />
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

SubscriptionPage.contextType = AppContext;

SubscriptionPage.propTypes = {
  intl: intlShape.isRequired,
  isEmpty: PropTypes.bool,
  isRedirect: PropTypes.bool,
  fetchBasket: PropTypes.func.isRequired,
  summaryQuantity: PropTypes.number,
  summarySubtotal: PropTypes.number,
};

SubscriptionPage.defaultProps = {
  isEmpty: false,
  isRedirect: false,
  summaryQuantity: undefined,
  summarySubtotal: undefined,
};

const mapStateToProps = (state) => ({
  // TODO: update this selector for subscription
  ...paymentSelector(state),
});

export default connect(mapStateToProps, { fetchBasket })(injectIntl(SubscriptionPage));
