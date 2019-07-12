import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Input, ValidationFormGroup } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-i18n';

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

  renderAdd() {
    const {
      code, intl, loading,
    } = this.props;

    const id = 'couponField';

    return (
      <form onSubmit={this.handleAddSubmit} className="mb-3 d-flex align-items-end">
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
          <span className="text-muted">
            {intl.formatMessage(messages['payment.coupon.benefit_value'], {
            code,
            value: benefitValue,
            })}
          </span> :
          <span className="text-muted">
            {intl.formatMessage(messages['payment.coupon.benefit.default'], {
            code,
            })}
          </span>
        }
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
