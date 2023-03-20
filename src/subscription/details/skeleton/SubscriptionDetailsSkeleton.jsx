import React from 'react';
import { Skeleton } from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const SubscriptionDetailsSkeleton = () => (
  <div className="sub-cart-skeleton">
    <span className="sr-only">
      <FormattedMessage
        id="subscription.screen.reader.details.loading"
        defaultMessage="Loading, please wait..."
        description="Screen reader text to be read when subscription details are loading."
      />
    </span>
    <Skeleton width="25%" />
    <div className="d-flex justify-content-between mb-2 align-items-center">
      <Skeleton height="28px" containerClassName="sub-skeleton-title mr-3" />
      <Skeleton height="24px" containerClassName="sub-skeleton-badge" />
    </div>
    <Skeleton width="45%" />
    <Skeleton width="65%" className="mb-4" />

    <div className="row align-items-center mb-5">
      <div className="col-5">
        <Skeleton width="80%" className="mb-2" />
        <Skeleton height="100%" className="embed-responsive embed-responsive-16by9" />
      </div>
      <div className="col-7 pl-0">
        <Skeleton className="skeleton mb-2 w-50" />
        <Skeleton className="skeleton mr-4 py-1" />
      </div>
    </div>
    <Skeleton width="25%" />
    <div className="d-flex justify-content-between mb-5 price">
      <Skeleton width="70%" containerClassName="section-left" />
      <Skeleton width="70%" containerClassName="section-right" />
    </div>
    <div className="d-flex justify-content-between mb-4 price">
      <Skeleton width="70%" containerClassName="section-left" />
      <Skeleton width="70%" containerClassName="section-right" />
    </div>
    <Skeleton width="25%" />
    <Skeleton width="50%" />
    <Skeleton width="100%" className="mb-4" />
    <Skeleton width="100%" className="py-5" />
  </div>
);

export default SubscriptionDetailsSkeleton;
