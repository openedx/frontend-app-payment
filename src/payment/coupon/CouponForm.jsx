import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Input, ValidationFormGroup } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-i18n';

import messages from './messages';
import { addCoupon, removeCoupon, updateCouponDraft } from './data/actions';
import { PERCENTAGE_BENEFIT, ABSOLUTE_BENEFIT } from './data/constants';
import Benefit from './Benefit';

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
    this.props.removeCoupon(this.props.voucherId);
  }

  renderAdd() {
    const {
      code, intl, error, loading,
    } = this.props;

    const id = 'couponField';

    return (
      <form onSubmit={this.handleAddSubmit}>
        <ValidationFormGroup for={id} invalid={error !== null} invalidMessage={error}>
          <label className="h6 d-block" htmlFor={id}>
            {intl.formatMessage(messages['payment.coupon.label'])}
          </label>
          <Input
            className="mb-2"
            name={id}
            id={id}
            type="text"
            value={code || ''}
            onChange={this.handleChange}
          />
          <Button disabled={loading} className="btn-primary" type="submit">
            {intl.formatMessage(messages['payment.coupon.submit'])}
          </Button>
        </ValidationFormGroup>
      </form>
    );
  }

  renderRemove() {
    const { intl } = this.props;
    return (
      <form onSubmit={this.handleRemoveSubmit} className="d-flex align-items-center mb-3">
        {this.props.benefit !== null ? (
          <Benefit code={this.props.code} {...this.props.benefit} />
        ) : null}
        <Button className="btn-link display-inline p-0 pl-3 border-0" type="submit">
          {intl.formatMessage(messages['payment.coupon.remove'])}
        </Button>
      </form>
    );
  }

  render() {
    if (this.props.voucherId !== null) {
      return this.renderRemove();
    }

    return this.renderAdd();
  }
}

CouponForm.propTypes = {
  loading: PropTypes.bool,
  code: PropTypes.string,
  voucherId: PropTypes.number,
  error: PropTypes.string,
  addCoupon: PropTypes.func.isRequired,
  removeCoupon: PropTypes.func.isRequired,
  updateCouponDraft: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  benefit: PropTypes.shape({
    type: PropTypes.oneOf([PERCENTAGE_BENEFIT, ABSOLUTE_BENEFIT]).isRequired,
    value: PropTypes.number.isRequired,
  }),
};

CouponForm.defaultProps = {
  loading: false,
  code: '',
  voucherId: null,
  error: null,
  benefit: null,
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
