import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './Cart.messages';
import { cartSelector } from '../data/selectors';
import { ORDER_TYPES } from '../data/constants';

import BulkOrderSummaryTable from './BulkOrderSummaryTable';
import CartSkeleton from './CartSkeleton';
import CartContents from './CartContents';
import CouponForm from './CouponForm';
import CurrencyDisclaimer from './CurrencyDisclaimer';
import OrderSummary from './OrderSummary';
import OrderDetails from './order-details';
import Offers from './Offers';
import ProductLineItem from './ProductLineItem';
import SummaryTable from './SummaryTable';
import TotalTable from './TotalTable';
import UpdateQuantityForm from './UpdateQuantityForm';

class Cart extends React.Component {
  renderCart() {
    const {
      products,
      orderType,
      isCurrencyConverted,
      isPaymentVisualExperiment,
      isNumEnrolledExperiment,
      REV1045Experiment,
      isPriceMessageExperiment,
      enrollmentCountData,
      orderTotal,
      showCouponForm,
      summaryPrice,
      summarySubtotal,
      summaryQuantity,
      summaryDiscounts,
      offers,
      loaded
    } = this.props;

    const isBulkOrder = orderType === ORDER_TYPES.BULK_ENROLLMENT;

    return (
      <div>
        <span className="sr-only">
          <FormattedMessage
            id="payment.screen.reader.cart.details.loaded"
            defaultMessage="Shopping cart details are loaded."
            description="Screen reader text to be read when cart details load."
          />
        </span>

        <CartContents>
          {products && products.length ? products.map(product => (<ProductLineItem
            key={product.title}
            isNumEnrolledExperiment={isNumEnrolledExperiment}
            REV1045Experiment={REV1045Experiment}
            isPaymentVisualExperiment={isPaymentVisualExperiment}
            enrollmentCountData={enrollmentCountData}
            {...product}
          />)) : (REV1045Experiment ? <div className="row align-items-center mb-5">
        <div className="col-5">
          <div className="skeleton embed-responsive embed-responsive-16by9" />
        </div>
        <div className="col-7">
          <div className="skeleton py-2 mb-3 w-50" />
          <div className="skeleton py-2 mr-4" />
        </div>
      </div> : null)}

          {isBulkOrder ? <UpdateQuantityForm /> : null}
        </CartContents>

        {!REV1045Experiment || loaded ? <OrderSummary>
          {isBulkOrder ? (
            <BulkOrderSummaryTable
              price={summaryPrice}
              subtotal={summarySubtotal}
              quantity={summaryQuantity}
            />
          ) : (
            <SummaryTable price={summaryPrice} />
          )}

          <Offers discounts={summaryDiscounts} offers={offers} isBundle={products.length > 1} />
          {showCouponForm ?
            <CouponForm isPaymentVisualExperiment={isPaymentVisualExperiment} /> : null}
          <TotalTable total={orderTotal} />
          {isCurrencyConverted ? <CurrencyDisclaimer /> : null}
        </OrderSummary> : (<React.Fragment><div className="skeleton py-2 mb-3 w-50" />
      <div className="skeleton py-2 mb-2" />
      <div className="skeleton py-2 mb-5" /></React.Fragment>)}

        <OrderDetails REV1045Experiment={REV1045Experiment} />
        {isPriceMessageExperiment ?
          <React.Fragment>
            <h5>Thanks for supporting our mission!</h5>
            <p>Did you know? We rely on paid commitments to support our mission of increasing access to high-quality education for learners like you, everywhere.</p>
          </React.Fragment>
        : null}
      </div>
    );
  }

  render() {
    const {
      intl,
      loading,
      loaded,
      REV1045Experiment,
    } = this.props;

    return (
      <section
        aria-live="polite"
        aria-relevant="all"
        aria-label={intl.formatMessage(messages['payment.section.cart.label'])}
      >
        {!REV1045Experiment && loading ? <CartSkeleton /> : this.renderCart() }
      </section>
    );
  }
}


Cart.propTypes = {
  intl: intlShape.isRequired,
  isPaymentVisualExperiment: PropTypes.bool,
  isNumEnrolledExperiment: PropTypes.bool,
  REV1045Experiment: PropTypes.bool,
  isPriceMessageExperiment: PropTypes.bool,
  enrollmentCountData: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    enrollment_count: PropTypes.number,
  })),
  loading: PropTypes.bool,
  loaded: PropTypes.bool,
  products: PropTypes.arrayOf(PropTypes.shape({
    imageUrl: PropTypes.string,
    title: PropTypes.string,
    certificateType: PropTypes.oneOf(['audit', 'honor', 'verified', 'no-id-professional', 'professional', 'credit']),
  })),
  showCouponForm: PropTypes.bool,
  orderType: PropTypes.oneOf(Object.values(ORDER_TYPES)),
  isCurrencyConverted: PropTypes.bool,
  orderTotal: PropTypes.number,
  offers: PropTypes.arrayOf(PropTypes.shape({
    benefitType: PropTypes.oneOf(['Percentage', 'Absolute']).isRequired,
    benefitValue: PropTypes.number.isRequired,
    provider: PropTypes.string,
  })),
  summarySubtotal: PropTypes.number,
  summaryQuantity: PropTypes.number,
  summaryDiscounts: PropTypes.number,
  summaryPrice: PropTypes.number,
};

Cart.defaultProps = {
  isPaymentVisualExperiment: false,
  isNumEnrolledExperiment: false,
  REV1045Experiment: false,
  isPriceMessageExperiment: false,
  enrollmentCountData: null,
  loading: true,
  loaded: false,
  products: [],
  orderType: ORDER_TYPES.SEAT,
  showCouponForm: false,
  isCurrencyConverted: false,
  orderTotal: undefined,
  offers: [],
  summarySubtotal: undefined,
  summaryQuantity: undefined,
  summaryDiscounts: undefined,
  summaryPrice: undefined,
};

export default connect(cartSelector)(injectIntl(Cart));
