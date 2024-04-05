import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent } from '@edx/frontend-platform/analytics';

import messages from './PaymentPage.messages';

// Actions
import { fetchBasket, fetchExistingBasket } from './data/actions';

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
    };
  }

  componentDidMount() {
    const sku = localStorage.getItem('sku');

    // Check if SKU is not null
    if (sku !== null) {
      const paymentPage = `${getConfig().ECOMMERCE_BASE_URL}/basket/add/?sku=${sku}`;
      window.location.href = paymentPage;
    }

    sendPageEvent();
    this.props.fetchBasket();
    localStorage.removeItem('sku');
  }

  renderContent() {
    const { isEmpty, isRedirect } = this.props;
    const {
      isNumEnrolledExperiment,
      REV1045Experiment,
      isTransparentPricingExperiment,
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
          <Checkout />
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

const mapStateToProps = (state) => ({
  ...paymentSelector(state),
});

export default connect(mapStateToProps, { fetchBasket })(injectIntl(PaymentPage));
