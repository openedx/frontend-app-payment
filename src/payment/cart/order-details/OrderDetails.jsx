import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import messages from './messages';
import { orderDetailsMapStateToProps } from './data/selectors';

class OrderDetails extends Component {
  renderSimpleMessage() {
    return (
      <p>
        {this.props.intl.formatMessage(messages[`payment.order.details.course.${this.props.messageType}`])}
      </p>
    );
  }

  renderEnrollmentCodeMessage() {
    return (
      <React.Fragment>
        <FormattedMessage
          id="payment.order.details.enrollment.code.terms"
          defaultMessage="By purchasing, you and your organization agree to the following terms:"
          description=""
          tagName="p"
        />
        <ul>
          <FormattedMessage
            id="payment.order.details.enrollment.code.first.term"
            defaultMessage="Each code is valid for the one course covered and can be used only one time."
            description="One of many terms of purchase shown prior to purchasing a course."
            tagName="li"
          />
          <FormattedMessage
            id="payment.order.details.enrollment.code.second.term"
            defaultMessage="You are responsible for distributing codes to your learners in your organization."
            description="One of many terms of purchase shown prior to purchasing a course."
            tagName="li"
          />
          <FormattedMessage
            id="payment.order.details.enrollment.code.third.term"
            defaultMessage="Each code will expire in one year from date of purchase or, if earlier, once the course is closed."
            description="One of many terms of purchase shown prior to purchasing a course."
            tagName="li"
          />
          <FormattedMessage
            id="payment.order.details.enrollment.code.fourth.term"
            defaultMessage="If a course is not designated as self-paced, you should confirm that a course run is available before expiration."
            description="One of many terms of purchase shown prior to purchasing a course."
            tagName="li"
          />
          <FormattedMessage
            id="payment.order.details.enrollment.code.fifth.term"
            defaultMessage="You may not resell codes to third parties."
            description="One of many terms of purchase shown prior to purchasing a course."
            tagName="li"
          />
          <FormattedMessage
            id="payment.order.details.enrollment.code.sixth.term"
            defaultMessage="All edX for Business sales are final and not eligible for refunds."
            description="One of many terms of purchase shown prior to purchasing a course."
            tagName="li"
          />
        </ul>
        <FormattedMessage
          id="payment.order.details.enrollment.code.receive.email"
          defaultMessage="You will receive an email at {userEmail} with your enrollment code(s)."
          description="Informs the user that they will receive enrollment codes at the specified email address."
          tagName="p"
          values={{
            userEmail: this.context.authenticatedUser.email,
          }}
        />
      </React.Fragment>
    );
  }

  renderMessage() {
    if (this.props.messageType === 'enrollment.code') {
      return this.renderEnrollmentCodeMessage();
    }
    return this.renderSimpleMessage();
  }

  render() {
    if (this.props.messageType === null) {
      return null;
    }
    return (
      <div className="basket-section">
        <FormattedMessage
          id="payment.order.details.heading"
          defaultMessage="Order Details"
          description="The heading for details about an order"
        >
          {text => <h5 aria-level="2">{text}</h5>}
        </FormattedMessage>
        {this.renderMessage()}
      </div>
    );
  }
}

OrderDetails.contextType = AppContext;

OrderDetails.propTypes = {
  intl: intlShape.isRequired,
  messageType: PropTypes.oneOf([
    'enrollment.code',
    'entitlement',
    'seat.verified',
    'seat.credit',
    'seat',
  ]),
};

OrderDetails.defaultProps = {
  messageType: null,
};

export default connect(
  orderDetailsMapStateToProps,
  {},
)(injectIntl(OrderDetails));
