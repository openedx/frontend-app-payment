/* eslint-disable max-len */
import React from 'react';
import { useSelector } from 'react-redux';
import {
  FormattedMessage, useIntl,
} from '@edx/frontend-platform/i18n';

import messages from '../../payment/cart/Cart.messages';
import { detailsSelector } from '../data/details/selectors';

import CurrencyDisclaimer from '../../payment/cart/CurrencyDisclaimer';
import OrderSummary from '../../payment/cart/OrderSummary';
import ProductLineItem from '../../payment/cart/ProductLineItem';
import SummaryTable from '../../payment/cart/SummaryTable';
import TotalTable from '../../payment/cart/TotalTable';

import SubscriptionDetailsSkeleton from './skeleton/SubscriptionDetailsSkeleton';
import SubscriptionLegal from './legal/SubscriptionLegal';
import SubscriptionContent from './content/SubscriptionContent';
import SubscriptionOrderDetails from './order-details/SubscriptionOrderDetails';

/**
 * SubscriptionDetails component
 * renders the subscription details
 */
export const SubscriptionDetails = () => {
  const intl = useIntl();
  const {
    loading,
    loaded,
    products,
    isCurrencyConverted,
    summaryPrice,
    details,
  } = useSelector(detailsSelector);

  const renderDetails = () => (
    <div>
      <span className="sr-only">
        <FormattedMessage
          id="subscription.screen.reader.details.loaded"
          defaultMessage="Shopping details are loaded."
          description="Screen reader text to be read when details load."
        />
      </span>

      <SubscriptionContent details={details}>
        {products.map(product => (
          <ProductLineItem
            key={product.title}
            {...product}
          />
        ))}
      </SubscriptionContent>
      {loaded
        ? (
          <OrderSummary>
            <SummaryTable price={summaryPrice} isSubscription />
            <TotalTable total={details.price} isSubscription />
            {isCurrencyConverted ? <CurrencyDisclaimer /> : null}
          </OrderSummary>
        ) : (
          <>
            <div className="skeleton py-2 mb-3 w-50" />
            <div className="skeleton py-2 mb-2" />
            <div className="skeleton py-2 mb-5" />
          </>
        )}
      <SubscriptionOrderDetails programTitle={details.programTitle} />
      <SubscriptionLegal programTitle={details.programTitle} price={details.price} />
    </div>
  );

  return (
    <section
      aria-live="polite"
      aria-relevant="all"
      aria-label={intl.formatMessage(messages['payment.section.cart.label'])}
    >
      {loading ? <SubscriptionDetailsSkeleton /> : renderDetails() }
    </section>
  );
};

export default SubscriptionDetails;
