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
    return ['ccx-v1:HarvardX+MCB64.1x+2T2016+ccx@28', 'course-v1:HarvardX+1368x+1T2017', 'course-v1:HarvardX+1962USRx+3T2019', 'course-v1:HarvardX+1962USRx+3T2020', 'course-v1:HarvardX+AESTHINT15+2T2020', 'course-v1:HarvardX+AP50+1516', 'course-v1:HarvardX+AP50x+2T2018', 'course-v1:HarvardX+ARP+3T2019', 'course-v1:HarvardX+AT1x+2T2020', 'course-v1:HarvardX+BokX+2T2019', 'course-v1:HarvardX+BUS5.1x+3T2017', 'course-v1:HarvardX+CalcAPL1x+2T2020', 'course-v1:HarvardX+CHA01+1T2020', 'course-v1:HarvardX+CHEM160.en.2x+1T2018', 'course-v1:HarvardX+CHEM160.en.3x+1T2018', 'course-v1:HarvardX+CHEM160es+1T2018', 'course-v1:HarvardX+ChinaPhil+2T2020', 'course-v1:HarvardX+CHNSLITx+1T2020', 'course-v1:HarvardX+CIV101+2T2021', 'course-v1:HarvardX+COV19x+1T2020', 'course-v1:HarvardX+CS50+Business', 'course-v1:HarvardX+CS50+Technology', 'course-v1:HarvardX+CS50+X', 'course-v1:HarvardX+CS50AI+1T2020', 'course-v1:HarvardX+CS50AI+AI', 'course-v1:HarvardX+CS50B+Business', 'course-v1:HarvardX+CS50DM+2T2019', 'course-v1:HarvardX+CS50DM+DigitalMedia', 'course-v1:HarvardX+CS50DM+Media', 'course-v1:HarvardX+CS50G+Games', 'course-v1:HarvardX+CS50L+1T2019', 'course-v1:HarvardX+CS50L+Law', 'course-v1:HarvardX+CS50T+Technology', 'course-v1:HarvardX+CS50W+1T2018', 'course-v1:HarvardX+CS50W+Web', 'course-v1:HarvardX+DH102+1T2050', 'course-v1:HarvardX+DigHum_01+1T2020', 'course-v1:HarvardX+ECD01+3T2020', 'course-v1:HarvardX+EEEA+2T2020', 'course-v1:HarvardX+EMC2x+2T2020', 'course-v1:HarvardX+ENGSCI137x+2T2020', 'course-v1:HarvardX+EP001+1T2020', 'course-v1:HarvardX+ER22.1x+1T2020', 'course-v1:HarvardX+ER22.1x+1T2021', 'course-v1:HarvardX+ER22.1x+2T2020', 'course-v1:HarvardX+ER22.1x+2T2021', 'course-v1:HarvardX+ER22.1x+3T2020', 'course-v1:HarvardX+FC1x+1T2020', 'course-v1:HarvardX+FOX+2T2019', 'course-v1:HarvardX+FXB001+2T2020', 'course-v1:HarvardX+FXB001+3T2019', 'course-v1:HarvardX+GIZA+2T2020', 'course-v1:HarvardX+GIZA+2T2020a', 'course-v1:HarvardX+GSD1x+1T2020', 'course-v1:HarvardX+GSD1x+1T2021', 'course-v1:HarvardX+GSD1x+1T2022', 'course-v1:HarvardX+GSD1x+2T2019', 'course-v1:HarvardX+GSD1x+3T2020', 'course-v1:HarvardX+GSE2x+2T2020', 'course-v1:HarvardX+GSE2x+3T2019', 'course-v1:HarvardX+GSE3x+2T2020', 'course-v1:HarvardX+GSE3x+3T2019', 'course-v1:HarvardX+GSE4x+1T2020', 'course-v1:HarvardX+GSE4x+2T2020', 'course-v1:HarvardX+HDS2825x+1T2019', 'course-v1:HarvardX+HDS2825x+1T2020', 'course-v1:HarvardX+HDS2825x+3T2017', 'course-v1:HarvardX+HDS3221.1x+1T2018', 'course-v1:HarvardX+HDS3221.1x+1T2019', 'course-v1:HarvardX+HDS3221.1x+3T2020', 'course-v1:HarvardX+HDS3221.2x+1T2018', 'course-v1:HarvardX+HDS3221.2x+2T2019', 'course-v1:HarvardX+HDS3221.2x+3T2020', 'course-v1:HarvardX+HDS3221.3x+1T2018', 'course-v1:HarvardX+HDS3221.3x+1T2019', 'course-v1:HarvardX+HDS3221.3x+3T2020', 'course-v1:HarvardX+HDS3221.4x+1T2018', 'course-v1:HarvardX+HDS3221.4x+1T2019', 'course-v1:HarvardX+HDS3221.4x+3T2020', 'course-v1:HarvardX+HDS3221.5x+1T2018', 'course-v1:HarvardX+HDS3221.5x+2T2019', 'course-v1:HarvardX+HDS3221.5x+3T2020', 'course-v1:HarvardX+HDS3221.6x+2T2018', 'course-v1:HarvardX+HDS3221.6x+2T2019', 'course-v1:HarvardX+HDS3221.6x+3T2020', 'course-v1:HarvardX+HDS3221.7x+1T2018', 'course-v1:HarvardX+HDS3221.7x+2T2019', 'course-v1:HarvardX+HDS3221.7x+3T2020', 'course-v1:HarvardX+HDS99.1x+1T2016', 'course-v1:HarvardX+HHP100+1T2020', 'course-v1:HarvardX+HKS101A_1+2T2019', 'course-v1:HarvardX+HKS101A_1+2T2020', 'course-v1:HarvardX+HKS101A_2+2T2019', 'course-v1:HarvardX+HKS101A_2+2T2020', 'course-v1:HarvardX+HKS101A_3+2T2019', 'course-v1:HarvardX+HKS101A_3+2T2020', 'course-v1:HarvardX+HKS101A_4+2T2019', 'course-v1:HarvardX+HKS101A_4+2T2020', 'course-v1:HarvardX+HLS0ax+2T2020', 'course-v1:Harvardx+HLS2X+1T2020a', 'course-v1:Harvardx+HLS2X+3T2020', 'course-v1:HarvardX+HLS3x+1T2018', 'course-v1:HarvardX+HLS4X+2T2019', 'course-v1:HarvardX+HLS4X+2T2020', 'course-v1:HarvardX+Hum1-10x+3T2019', 'course-v1:HarvardX+HUM1.10x+1T2020', 'course-v1:HarvardX+HUM1.10x+3T2017', 'course-v1:HarvardX+HUM12.1x+1T2020', 'course-v1:HarvardX+HUM12.2x+1T2020', 'course-v1:HarvardX+HUM12x+1T2020', 'course-v1:HarvardX+HUM2x+1T2020', 'course-v1:HarvardX+HUM2x+2T2020', 'course-v1:HarvardX+Hum3.0x+1T2020', 'course-v1:HarvardX+Hum3.1x+1T2020', 'course-v1:HarvardX+Hum3.1x+3T2016', 'course-v1:HarvardX+Hum3.2x+2T2020', 'course-v1:HarvardX+Hum3.3x+2T2020', 'course-v1:HarvardX+HX102+3T2018', 'course-v1:HarvardX+HX205+1T2019', 'course-v1:HarvardX+LBTechX1+1T2020', 'course-v1:HarvardX+LEAD1x+1T2020a', 'course-v1:HarvardX+LTL1x+1T2019', 'course-v1:harvardx+MCB63X+1T2020', 'course-v1:HarvardX+MCB64.1x+2T2020', 'course-v1:HarvardX+MCB80.1x+2T2020', 'course-v1:HarvardX+MCB80.1x+3T2019', 'course-v1:HarvardX+MCB80.2x+2T2020', 'course-v1:HarvardX+MCB80.2x+3T2019', 'course-v1:HarvardX+MCB80.3x+2T2020', 'course-v1:HarvardX+MCB80.3x+3T2019', 'course-v1:HarvardX+MMM+2T2020', 'course-v1:HarvardX+MUS24.1x+3T2019', 'course-v1:HarvardX+MUS24.2x+3T2019', 'course-v1:HarvardX+MUS24.3x+3T2019', 'course-v1:HarvardX+MUS24.4x+3T2019', 'course-v1:HarvardX+MUS24.5x+3T2019', 'course-v1:HarvardX+MUS24.6x+2T2019', 'course-v1:HarvardX+MUS24.6x+2T2020', 'course-v1:HarvardX+MUS24.7x+2T2019', 'course-v1:HarvardX+MUS24.7x+2T2020', 'course-v1:HarvardX+Newton101+1T2018', 'course-v1:HarvardX+PH125.1x+2T2020', 'course-v1:HarvardX+PH125.2x+2T2020', 'course-v1:HarvardX+PH125.3x+2T2020', 'course-v1:HarvardX+PH125.4x+2T2020', 'course-v1:HarvardX+PH125.5x+2T2020', 'course-v1:HarvardX+PH125.6x+2T2020', 'course-v1:HarvardX+PH125.7x+2T2020', 'course-v1:HarvardX+PH125.8x+2T2020', 'course-v1:HarvardX+PH125.9x+2T2020', 'course-v1:HarvardX+PH211x+1T2020', 'course-v1:HarvardX+PH278.Ax+1T2020', 'course-v1:HarvardX+PH278.Ax+3T2020', 'course-v1:HarvardX+PH425x+3T2019', 'course-v1:HarvardX+PH525.1x+1T2020', 'course-v1:HarvardX+PH525.1x+3T2020', 'course-v1:HarvardX+PH525.2x+1T2020', 'course-v1:HarvardX+PH525.2x+3T2020', 'course-v1:HarvardX+PH525.3x+1T2020', 'course-v1:HarvardX+PH525.3x+3T2020', 'course-v1:HarvardX+PH525.4x+1T2020', 'course-v1:HarvardX+PH525.4x+3T2020', 'course-v1:HarvardX+PH525.5x+1T2020', 'course-v1:HarvardX+PH525.5x+3T2019', 'course-v1:HarvardX+PH525.6x+1T2020', 'course-v1:HarvardX+PH525.6x+3T2019', 'course-v1:HarvardX+PH525.7x+1T2020', 'course-v1:HarvardX+PH525.7x+3T2019', 'course-v1:HarvardX+PH526x+1T2020', 'course-v1:HarvardX+PH526x+2T2020', 'course-v1:HarvardX+PH527x+1T2020', 'course-v1:HarvardX+PH555x+3T2019', 'course-v1:HarvardX+PH557x+3T2019', 'course-v1:HarvardX+PH557x+3T2020', 'course-v1:HarvardX+PH558x+2T2020', 'course-v1:HarvardX+PH558x+3T2020', 'course-v1:HarvardX+PH559x+2T2020', 'course-v1:HarvardX+PH559x+3T2019', 'course-v1:HarvardX+predv1+2015_T3', 'course-v1:HarvardX+PS11.1x+1T2019', 'course-v1:HarvardX+PXM101+1T2020', 'course-v1:HarvardX+QMB1+1T2020', 'course-v1:HarvardX+QMB1+2T2017', 'course-v1:HarvardX+QMB1+3T2017', 'course-v1:HarvardX+SKY101x+2T2020', 'course-v1:HarvardX+SKY101x+3T2019', 'course-v1:HarvardX+SOC1.jsx+2016', 'course-v1:HarvardX+SOC1.longx+1T2017', 'course-v1:HarvardX+SOC1.practx+1T2017', 'course-v1:HarvardX+SOC1.practx+1T2020', 'course-v1:HarvardX+SOC1.practx+2T2017', 'course-v1:HarvardX+SPU27.1x+3T2019', 'course-v1:HarvardX+SPU27.1x+3T2020', 'course-v1:HarvardX+SPU27.2x+2T2019', 'course-v1:HarvardX+SPU27.2x+3T2020', 'course-v1:HarvardX+SPU29x+3T2017', 'course-v1:HarvardX+STAT110x+2T2020', 'course-v1:HarvardX+SW12.1+1T2019a', 'course-v1:HarvardX+SW12.10x+2T2019', 'course-v1:HarvardX+SW12.2x+1T2019b', 'course-v1:HarvardX+SW12.3x+1T2019a', 'course-v1:HarvardX+SW12.4x+1T2019a', 'course-v1:HarvardX+SW12.5x+1T2019a', 'course-v1:HarvardX+SW12.6x+1T2019a', 'course-v1:HarvardX+SW12.7x+2T2019', 'course-v1:HarvardX+SW12.8x+1T2019b', 'course-v1:HarvardX+SW12.9x+2T2019', 'course-v1:HarvardX+SW25x+T32015', 'course-v1:HarvardX+SW25x.1+2T2020', 'course-v1:HarvardX+SW38+1T2019', 'course-v1:HarvardX+SW38+3T2019', 'course-v1:HarvardX+SW47x+1T2020', 'course-v1:HarvardX+SW47x+2T2019', 'course-v1:HarvardX+Urban101x+1T2020', 'course-v1:HarvardX+USW1920+2T2020', 'course-v1:HarvardX+USW1920+3T2019', 'course-v1:HarvardX+USW30x+1T2020', 'HarvardX/AI12.1x./2014_T3', 'HarvardX/CB22.2x/3T2014', 'HarvardX/HAA1x/1T2014', 'HarvardX/HLS1.1x/1T2014', 'HarvardX/HLS1xA/Copyright', 'HarvardX/HLS1xB/Copyright', 'HarvardX/HLS1xC/Copyright', 'HarvardX/HLS1xD/Copyright', 'HarvardX/MUS24x/1T2015', 'HarvardX/SPU17x/3T2013'];
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
