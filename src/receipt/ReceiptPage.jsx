import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-i18n';
import { MailtoLink, Table } from '@edx/paragon';

// Selectors
import { receiptSelector } from './data/selectors';

// Syles
import './ReceiptPage.scss';

const ReceiptPage = ({
  hasEnrollmentCodeProduct,
  products,
  totals,
  order,
}) => {
  const tableData = products.map(product => ({
    quantity: product.quantity,
    description: (
      <>
        <p className="mb-0">{product.description}</p>
        <span className="text-gray">{product.organization}</span>
      </>
    ),
    itemPrice: product.itemPrice,
  }));

  return (
    <div className="page__receipt container-fluid py-5">
      <Helmet title="Receipt for EDX-188304" />
      <div className="row mb-4">
        <div className="col">
          <h1 className="mb-0">
            <FormattedMessage
              id="receipt.page.heading"
              defaultMessage="Thank you for your order!"
              description="The heading for the receipt page"
            />
          </h1>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-12 col-lg-8">
          <p className="confirmation-message">
            {hasEnrollmentCodeProduct ? (
              <FormattedMessage
                id="receipt.page.enrollment_code_confirmation"
                description="The message that describes the order confirmation when the order contains an enrollment code purchase."
                defaultMessage="Your order is complete. You will receive a confirmation message and your enrollment code(s) at {email}. If you need a receipt, you can print this page."
                values={{
                  email: <MailtoLink to="astankiewicz@edx.org">astankiewicz@edx.org</MailtoLink>,
                }}
              />
            ) : (
              <FormattedMessage
                id="receipt.page.confirmation"
                description="The message that describes the order confirmation."
                defaultMessage="Your order is complete. If you need a receipt, you can print this page. You will also receive a confirmation message with this information at {email}."
                values={{
                  email: <MailtoLink to="astankiewicz@edx.org">astankiewicz@edx.org</MailtoLink>,
                }}
              />
            )}
          </p>
          <address className="text-gray">
            {order.address.map(line => (
              <>
                {line}<br />
              </>
            ))}
          </address>
        </div>
        <div className="col-12 col-lg-4">
          <dl>
            <dt className="order-detail-heading">Order Number</dt>
            <dd className="order=detail-text mb-3">{order.number}</dd>
            <dt className="order-detail-heading">Payment Method</dt>
            <dd className="order=detail-text mb-3">{order.payment}</dd>
            <dt className="order-detail-heading">Order Date</dt>
            <dd className="order=detail-text mb-3">{order.date}</dd>
          </dl>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <h2 className="mb-4">Order Information</h2>
          <Table
            data={tableData}
            columns={[
              {
                label: 'Quantity',
                key: 'quantity',
              },
              {
                label: 'Description',
                key: 'description',
              },
              {
                label: 'Item Price',
                key: 'itemPrice',
              },
            ]}
          />
        </div>
      </div>
      <div className="totals row mb-4">
        <div className="col">
            <div className="subtotal d-flex">
              <span />
              <span className="flex-grow-1 text-right font-weight-bold mr-5">Subtotal:</span>
              <span className="font-weight-bold">{totals.subtotal}</span>
            </div>
            <div className="total d-flex">
              <span style={{ width: '10%', padding: '0 12px' }} />
              <span className="flex-grow-1 text-right font-weight-bold mr-5" style={{ padding: '12px' }}>Total:</span>
              <span className="font-weight-bold" style={{ width: '10%', padding: '12px' }}>{totals.total}</span>
            </div>
        </div>
      </div>
      <div className="row no-gutters d-flex align-items-center py-3 px-4 mb-4" style={{ boxShadow: '0 1px 1px 2px rgba(0,0,0,0.2)', borderTop: '3px solid #ffc01f' }}>
        <div className="col-12 col-lg-7 mb-4 mb-lg-0">
          <h3 className="h5">Verify Your Identity</h3>
          <p className="mb-0">
            To receive a verified certificate, you have to verify your identity using your <strong>webcam</strong> and an <strong>official government-issued photo identification</strong> before the verification deadline.
          </p>
        </div>
        <div className="col-12 col-lg-4 offset-lg-1">
          <a className="btn btn-primary btn-block mb-2" href="https://courses.stage.edx.org/verify_student/reverify">
            Verify Now
          </a>
          <a className="d-block text-center" href="https://courses.stage.edx.org/dashboard">
            <small>Go to my dashboard and verify later</small>
          </a>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col text-right">
          <a href="/">Find more courses →</a>
        </div>
      </div>
    </div>
  );
}

ReceiptPage.propTypes = {
  intl: intlShape.isRequired,
  hasEnrollmentCodeProduct: PropTypes.string.isRequired,
  products: PropTypes.arrayOf(PropTypes.shape({})),
  totals: PropTypes.shape({}),
  order: PropTypes.shape({}),
};

ReceiptPage.defaultProps = {};

export default connect(
  receiptSelector,
  {},
)(injectIntl(ReceiptPage));
