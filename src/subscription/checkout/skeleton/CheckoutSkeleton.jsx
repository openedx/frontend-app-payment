import React from 'react';
import { Skeleton } from '@edx/paragon';

const CheckoutSkeleton = () => (
  <>
    <Skeleton width="25%" className="skeleton py-1 mb-3" />
    <div className="row">
      <div className="col-lg-6">
        <Skeleton count={4} width="100%" className="py-2 mb-3" />
      </div>
      <div className="col-lg-6">
        <Skeleton count={4} width="100%" className="py-2 mb-3" />
      </div>
    </div>
    <Skeleton width="25%" className="py-1 mb-3 mt-5" />
    <div className="row">
      <div className="col-lg-6">
        <Skeleton className="py-2 mb-3" />
      </div>
      <div className="col-lg-6">
        <div className="row">
          <div className="col-lg-6">
            <Skeleton className="py-2 mb-3" />
          </div>
          <div className="col-lg-6">
            <Skeleton className="py-2 mb-3" />
          </div>
        </div>
      </div>
    </div>
    <div className="row justify-content-end">
      <div className="col-lg-6 col-md-12">
        <Skeleton className="py-2 mt-4" />
      </div>
    </div>
    <Skeleton width="70%" height="14px" className="mt-3" containerClassName="d-flex justify-content-end" />
  </>
);

export default CheckoutSkeleton;
