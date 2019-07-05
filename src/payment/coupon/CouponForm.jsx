import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Input, ValidationFormGroup } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-i18n';
import { logError } from '@edx/frontend-logging';

import messages from './messages';
import { addCoupon, removeCoupon, updateCouponDraft } from './data/actions';

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

  handleRemoveSubmit(event) {
    event.preventDefault();
    this.props.removeCoupon(this.props.id);
  }

  renderInvalidMessage() {
    const { code, errorCode, intl } = this.props;
    if (errorCode === null) {
      return null;
    }
    let invalidMessage = null;
    switch (errorCode) {
      // Cases that need a `code`
      case 'empty_basket':
      case 'already_applied_coupon':
      case 'code_does_not_exist':
      case 'code_expired':
      case 'code_not_active':
      case 'code_not_available':
      case 'code_not_valid':
        invalidMessage = intl.formatMessage(messages[`payment.coupon.error.${errorCode}`], {
          code,
        });
        break;
      default:
        invalidMessage = intl.formatMessage(messages['payment.coupon.error.unknown']);
        logError(`Unexpected payment coupon form errorCode: ${errorCode}`);
    }

    return invalidMessage;
  }

  renderAdd() {
    const {
      code, intl, errorCode, loading,
    } = this.props;

    const id = 'couponField';

    return (
      <form onSubmit={this.handleAddSubmit} className="mb-3 d-flex align-items-end">
        <ValidationFormGroup
          for={id}
          invalid={errorCode !== null}
          invalidMessage={this.renderInvalidMessage()}
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
        <Button disabled={loading} className="btn-primary" type="submit">
          {intl.formatMessage(messages['payment.coupon.submit'])}
        </Button>
      </form>
    );
  }

  renderRemove() {
    const { intl, code, benefitValue } = this.props;
    return (
      <form onSubmit={this.handleRemoveSubmit} className="d-flex align-items-center mb-3">
        {this.props.benefitValue !== null ?
          <span>{intl.formatMessage(messages['payment.coupon.benefit_value'], {
            code,
            value: benefitValue,
          })}
          </span> : null}
        <Button className="btn-link display-inline p-0 pl-3 border-0" type="submit">
          {intl.formatMessage(messages['payment.coupon.remove'])}
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
  errorCode: PropTypes.string,
  addCoupon: PropTypes.func.isRequired,
  removeCoupon: PropTypes.func.isRequired,
  updateCouponDraft: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  benefitValue: PropTypes.string,
};

CouponForm.defaultProps = {
  loading: false,
  code: '',
  id: null,
  errorCode: null,
  benefitValue: null,
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
