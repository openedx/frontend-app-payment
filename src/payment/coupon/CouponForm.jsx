import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Input, ValidationFormGroup } from '@edx/paragon';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-i18n';
import { sendTrackEvent } from '@edx/frontend-analytics';

import messages from './messages';
import { addCoupon, removeCoupon, updateCouponDraft } from './data/actions';
import LocalizedPrice from '../LocalizedPrice';

const renderMuted = txt => <span className="text-muted">{txt}</span>;

export class CouponForm extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleAddSubmit = this.handleAddSubmit.bind(this);
    this.handleRemoveSubmit = this.handleRemoveSubmit.bind(this);
  }

  handleChange(event) {
    const { value } = event.target;
    this.props.updateCouponDraft(value);
  }

  handleAddSubmit(event) {
    event.preventDefault();
    this.props.addCoupon(this.props.code);
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
    this.props.removeCoupon(this.props.id);
  }

  renderAdd() {
    const {
      code, intl, loading,
    } = this.props;

    const id = 'couponField';

    return (
      <form onSubmit={this.handleAddSubmit} className="summary-row d-flex align-items-end">
        <ValidationFormGroup
          for={id}
          invalid={false}
          className="mb-0 mr-2"
        >
          <label className="h6 d-block" htmlFor={id}>
            {intl.formatMessage(messages['payment.coupon.label'])}
          </label>
          <Input
            name={id}
            id={id}
            type="text"
            value={code || ''}
            onChange={this.handleChange}
          />
        </ValidationFormGroup>
        <Button disabled={loading} className="btn-primary" type="submit" onClick={this.handleSubmitButtonClick}>
          {intl.formatMessage(messages['payment.coupon.submit'])}
        </Button>
      </form>
    );
  }

  renderCouponMessage() {
    const {
      code, benefitValue, benefitType,
    } = this.props;

    if (benefitValue === null) {
      return (
        <FormattedMessage
          id="payment.coupon.benefit.default"
          defaultMessage="Coupon {code} applied"
          description="A coupon has been applied."
          values={{ code }}
        >
          {renderMuted}
        </FormattedMessage>);
    }

    if (benefitType === 'Absolute') {
      return (
        <span className="text-muted">
          <FormattedMessage
            id="payment.coupon.benefit.absolute"
            defaultMessage="Coupon {code} applied for {amount} off"
            description="A coupon has been applied for a fixed currency discount, like $10.  Currency symbol will already be provided."
            values={{
              code,
              amount: (
                <LocalizedPrice amount={benefitValue} />
              ),
            }}
          />
        </span>);
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
        </FormattedMessage>);
    }

    return null;
  }

  renderRemove() {
    return (
      <form onSubmit={this.handleRemoveSubmit} className="d-flex align-items-center mb-3">
        {this.renderCouponMessage()}
        <Button className="btn-link display-inline p-0 pl-3 border-0" type="submit">
          {this.props.intl.formatMessage(messages['payment.coupon.remove'])}
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
  loading: PropTypes.bool,
  code: PropTypes.string,
  id: PropTypes.number,
  addCoupon: PropTypes.func.isRequired,
  removeCoupon: PropTypes.func.isRequired,
  updateCouponDraft: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  benefitValue: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  benefitType: PropTypes.string,
};

CouponForm.defaultProps = {
  loading: false,
  code: '',
  id: null,
  benefitValue: null,
  benefitType: null,
};

// TODO this will all go away once the back end is updated
const mapStateToProps = (state) => {
  const props = Object.assign({}, state.payment.coupon);
  const serverBenefitValue = String(props.benefitValue || '');

  if (props.benefitType) { // backend has been updated!  \o/
    return props;
  }

  const matchAbsolute = serverBenefitValue.match(/\$(.+)/);
  const matchPercentage = serverBenefitValue.match(/(.+)%/);
  if (matchAbsolute) {
    props.benefitType = 'Absolute';
    props.benefitValue = matchAbsolute[1]; // eslint-disable-line prefer-destructuring
  } else if (matchPercentage) {
    props.benefitType = 'Percentage';
    props.benefitValue = matchPercentage[1]; // eslint-disable-line prefer-destructuring
  } else {
    props.benefitType = null;
    props.benefitValue = null;
  }

  return props;
};

export default connect(
  mapStateToProps,
  {
    updateCouponDraft,
    addCoupon,
    removeCoupon,
  },
)(injectIntl(CouponForm));
