import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Input, ValidationFormGroup } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-i18n';

import messages from './messages';

import { addCoupon, removeCoupon, updateCouponDraft } from './data/actions';

class CouponForm extends Component {
  componentDidMount() {}

  handleChange = (event) => {
    const { value } = event.target;
    this.props.updateCouponDraft(value);
  };

  handleSubmit = (event) => {
    event.preventDefault();

    if (this.props.voucherId) {
      this.props.removeCoupon(this.props.voucherId);
    } else {
      this.props.addCoupon(this.props.code);
    }
  };

  render() {
    const {
      code, voucherId, intl, error,
    } = this.props;

    const id = 'couponField';
    const label = intl.formatMessage(messages['payment.coupon.label']);
    const buttonLabel =
      voucherId !== null
        ? intl.formatMessage(messages['payment.coupon.remove'])
        : intl.formatMessage(messages['payment.coupon.submit']);
    return (
      <form onSubmit={this.handleSubmit}>
        <ValidationFormGroup for={id} invalid={error !== null} invalidMessage={error}>
          <label className="h6 d-block" htmlFor={id}>
            {label}
          </label>
          <Input
            className="mb-2"
            name={id}
            id={id}
            type="text"
            value={code || ''}
            onChange={this.handleChange}
          />
          <Button className="btn-primary" type="submit">
            {buttonLabel}
          </Button>
        </ValidationFormGroup>
      </form>
    );
  }
}

CouponForm.propTypes = {
  code: PropTypes.string,
  voucherId: PropTypes.number,
  error: PropTypes.string,
  addCoupon: PropTypes.func.isRequired,
  removeCoupon: PropTypes.func.isRequired,
  updateCouponDraft: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

CouponForm.defaultProps = {
  code: '',
  voucherId: null,
  error: null,
};

const mapStateToProps = state => state.payment.coupon;

export default connect(
  mapStateToProps,
  {
    updateCouponDraft,
    addCoupon,
    removeCoupon,
  },
)(injectIntl(CouponForm));
