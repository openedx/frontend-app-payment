import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Input, ValidationFormGroup } from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import { addCoupon, removeCoupon } from '../data/actions';
import LocalizedPrice from './LocalizedPrice';

const renderMuted = txt => <span className="text-muted">{txt}</span>;

class CouponForm extends Component {
  constructor(props) {
    super(props);

    this.handleAddSubmit = this.handleAddSubmit.bind(this);
    this.handleRemoveSubmit = this.handleRemoveSubmit.bind(this);
  }

  handleAddSubmit(event) {
    event.preventDefault();
    this.props.addCoupon({ code: event.target.elements.couponField.value });
  }

  handleSubmitButtonClick() {
    sendTrackEvent(
      'edx.bi.ecommerce.basket.voucher_applied',
      {
        type: 'click',
        category: 'voucher-application',
      },
    );
  }

  handleRemoveSubmit(event) {
    event.preventDefault();
    this.props.removeCoupon({ id: this.props.id });
  }

  renderAdd() {
    const { code, isBasketProcessing } = this.props;
    const id = 'couponField';

    return (
      <form onSubmit={this.handleAddSubmit} className="summary-row d-flex align-items-end">
        <ValidationFormGroup for={id} invalid={false} className="mb-0 mr-2">
          <label className="h6 d-block" htmlFor={id}>
            <FormattedMessage
              id="payment.coupon.label"
              defaultMessage="Add coupon code (optional)"
              description="Label for the add coupon form"
            />
          </label>
          <Input name={id} id={id} type="text" defaultValue={code} />
        </ValidationFormGroup>
        <Button
          disabled={isBasketProcessing}
          variant="primary"
          type="submit"
          onClick={this.handleSubmitButtonClick}
        >
          <FormattedMessage
            id="payment.coupon.submit"
            defaultMessage="Apply"
            description="Submit button for the add coupon form"
          />
        </Button>
      </form>
    );
  }

  renderCouponMessage() {
    const { code, benefitValue, benefitType } = this.props;

    if (benefitType === 'Absolute') {
      return (
        <span className="text-muted">
          <FormattedMessage
            id="payment.coupon.benefit.absolute"
            defaultMessage="Coupon {code} applied for {amount} off"
            description="A coupon has been applied for a fixed currency discount, like $10.  Currency symbol will already be provided."
            values={{
              code,
              amount: <LocalizedPrice amount={benefitValue} />,
            }}
          />
        </span>
      );
    }

    if (benefitType === 'Percentage') {
      return (
        <FormattedMessage
          id="payment.coupon.benefit.percentage"
          defaultMessage="Coupon {code} applied for {amount}% off"
          description="A coupon has been applied for a percentage discount, like 10%.  Please place the % symbol as appropriate."
          values={{
            code,
            amount: benefitValue,
          }}
        >
          {renderMuted}
        </FormattedMessage>
      );
    }

    return (
      <FormattedMessage
        id="payment.coupon.benefit.default"
        defaultMessage="Coupon {code} applied"
        description="A coupon has been applied."
        values={{ code }}
      >
        {renderMuted}
      </FormattedMessage>
    );
  }

  renderRemove() {
    return (
      <form onSubmit={this.handleRemoveSubmit} className="d-flex align-items-center mb-3">
        {this.renderCouponMessage()}
        <Button
          className="display-inline p-0 pl-3 border-0"
          variant="link"
          type="submit"
          disabled={this.props.isBasketProcessing}
        >
          <FormattedMessage
            id="payment.coupon.remove"
            defaultMessage="Remove"
            description="Submit button to remove a coupon"
          />
        </Button>
      </form>
    );
  }

  render() {
    if (this.props.id !== null) {
      return this.renderRemove();
    }

    return this.renderAdd();
  }
}

CouponForm.propTypes = {
  isBasketProcessing: PropTypes.bool,
  code: PropTypes.string,
  id: PropTypes.number,
  addCoupon: PropTypes.func.isRequired,
  removeCoupon: PropTypes.func.isRequired,
  benefitValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  benefitType: PropTypes.string,
};

CouponForm.defaultProps = {
  isBasketProcessing: false,
  code: '',
  id: null,
  benefitValue: null,
  benefitType: null,
};

const mapStateToProps = (state) => {
  const { basket } = state.payment;
  const coupon = basket.coupons && basket.coupons.length ? basket.coupons[0] : {};

  return {
    ...coupon,
    isBasketProcessing: basket.isBasketProcessing,
  };
};

export default connect(
  mapStateToProps,
  {
    addCoupon,
    removeCoupon,
  },
)(CouponForm);
