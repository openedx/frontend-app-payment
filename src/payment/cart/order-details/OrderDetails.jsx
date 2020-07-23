import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import messages from './messages';
import { orderDetailsMapStateToProps } from './data/selectors';

class OrderDetails extends Component {
  getCookie(name) {
    const match = document.cookie.match(`${name}=([^;]*)`);
    return match ? match[1] : undefined;
  }

  getExcludedCourses() {
    return ['course1', 'course2'];
  }

  getText() {
    let text;
    const variation = this.getCookie('name_track_variation');
    const language = this.getCookie('prod-edx-language-preference');
    if (this.props.products.length === 1) {
      if (this.getExcludedCourses().indexOf(this.props.products[0].courseKey) > -1) {
        return null;
      }
    } else {
      return null;
    }

    if (language === 'es-419') {
      if (variation === 'V1') {
        text = 'Después de completar tu pedido, tendrás acceso ilimitado al curso.';
      } else if (variation === 'V2') {
        text = 'Después de completar tu pedido, estarás automáticamente en la Opción de Logro.';
      } else if (variation === 'V3') {
        text = 'Después de completar tu pedido, podrás acceder a todos los materiales del curso y serás elegibile para poder obtener un certificado.';
      }
    } else if (variation === 'V1') {
      text = 'After you complete your order you will obtain a verified certificate and unlimited access to the course';
    } else if (variation === 'V2') {
      text = 'After you complete your order you will automatically be in Achieve Mode.';
    } else if (variation === 'V3') {
      text = 'After you complete your order you will unlock access to all course materials and be eligible to pursue a certificate.';
    }
    return text;
  }

  renderSimpleMessage() {
    const text = this.getText();
    if (text) {
      return (
        <p>
          {text}
        </p>
      );
    }
    return (
      <p>
        {this.props.intl.formatMessage(messages[`payment.order.details.course.${this.props.messageType}`])}
      </p>
    );
  }

  renderEnrollmentCodeMessage() {
    return (
      <>
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
      </>
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
      return (this.props.REV1045Experiment ? (
        <><div className="skeleton py-2 mb-3 w-50" />
          <div className="skeleton py-2 mb-2 mr-4" />
          <div className="skeleton py-2 mb-5 w-75" />
        </>
      ) : null);
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
  REV1045Experiment: PropTypes.bool,
  products: PropTypes.arrayOf(PropTypes.shape({
    courseKey: PropTypes.string,
  })),
};

OrderDetails.defaultProps = {
  messageType: null,
  REV1045Experiment: false,
  products: [],
};

export default connect(
  orderDetailsMapStateToProps,
  {},
)(injectIntl(OrderDetails));
