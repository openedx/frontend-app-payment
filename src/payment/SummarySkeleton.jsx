import React from 'react';

export default function SummarySkeleton() {
  return (
    <div>
      <div className="skeleton py-2 mb-3 w-50" />
      <div className="skeleton py-2 mb-4 mr-4" />

      <div className="row align-items-center mb-5">
        <div className="col-5">
          <div className="skeleton embed-responsive embed-responsive-16by9" />
        </div>
        <div className="col-7">
          <div className="skeleton py-2 mb-3 w-50" />
          <div className="skeleton py-2 mr-4" />
        </div>
      </div>

      <div className="skeleton py-2 mb-3 w-50" />
      <div className="skeleton py-2 mb-2" />
      <div className="skeleton py-2 mb-5" />

      <div className="skeleton py-2 mb-3 w-50" />
      <div className="skeleton py-2 mb-2 mr-4" />
      <div className="skeleton py-2 mb-5 w-75" />
    </div>
  );
}
