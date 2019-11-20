import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-i18n';

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
      enrollmentCountData,
      orderTotal,
      showCouponForm,
      summaryPrice,
      summarySubtotal,
      summaryQuantity,
      summaryDiscounts,
      offers,
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
          {products.map(product => (<ProductLineItem
            key={product.title}
            isNumEnrolledExperiment={isNumEnrolledExperiment}
            isPaymentVisualExperiment={isPaymentVisualExperiment}
            enrollmentCountData={enrollmentCountData}
            {...product}
          />))}

          {isBulkOrder ? <UpdateQuantityForm /> : null}
        </CartContents>

        <OrderSummary>
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
        </OrderSummary>

        <OrderDetails />
      </div>
    );
  }

  render() {
    const {
      intl,
      loading,
    } = this.props;

    return (
      <section
        aria-live="polite"
        aria-relevant="all"
        aria-label={intl.formatMessage(messages['payment.section.cart.label'])}
      >
        {loading ? <CartSkeleton /> : this.renderCart() }
      </section>
    );
  }
}


Cart.propTypes = {
  intl: intlShape.isRequired,
  isPaymentVisualExperiment: PropTypes.bool,
  isNumEnrolledExperiment: PropTypes.bool,
  enrollmentCountData: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    enrollment_count: PropTypes.number,
  })),
  loading: PropTypes.bool,
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
  enrollmentCountData: null,
  loading: true,
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
