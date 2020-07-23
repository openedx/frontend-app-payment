import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';

class ProductLineItem extends React.PureComponent {
  getCookie(name) {
    const match = document.cookie.match(`${name}=([^;]*)`);
    return match ? match[1] : undefined;
  }

  getExcludedCourses() {
    return ['course1', 'course2'];
  }

  getText(courseKey) {
    let text;
    const variation = this.getCookie('name_track_variation');
    const language = this.getCookie('prod-edx-language-preference');
    if (this.getExcludedCourses().indexOf(courseKey) > -1) {
      return null;
    }
    if (language === 'es-419') {
      if (variation === 'V1') {
        text = 'Opción de Logro';
      } else if (variation === 'V2') {
        text = 'Opción Ilimitada';
      } else if (variation === 'V3') {
        text = ' ';
      }
    } else if (variation === 'V1') {
      text = 'Unlimited Track';
    } else if (variation === 'V2') {
      text = 'Achieve Mode';
    } else if (variation === 'V3') {
      text = ' ';
    }
    return text;
  }

  renderEnrollmentCount(courseKey, enrollmentCountData) {
    const courseObj = enrollmentCountData.find(course => course.key === courseKey);
    if (courseObj) {
      const enrollmentCount = courseObj.enrollment_count;
      return (
        <p className="num-enrolled"><span className="font-weight-bold">{enrollmentCount}</span> already enrolled!</p>
      );
    }
    return null;
  }

  renderCertificateType(certificateType, courseKey) {
    const text = this.getText(courseKey);
    switch (certificateType) {
      case 'professional':
      case 'no-id-professional':
        return (
          <FormattedMessage
            id="payment.productlineitem.professional.certificate"
            defaultMessage="Professional Certificate"
            description="Course certificate type on product details section"
          />
        );
      case 'verified':
        if (text) {
          return (text);
        }
        return (
          <FormattedMessage
            id="payment.productlineitem.verified.certificate"
            defaultMessage="Verified Certificate"
            description="Course certificate type on product details section"
          />
        );
      case 'honor':
      case 'audit':
      default:
        return null;
    }
  }

  render() {
    const {
      isNumEnrolledExperiment,
      enrollmentCountData,
      imageUrl,
      title,
      certificateType,
      courseKey,
    } = this.props;

    return (
      <div className="row align-items-center mb-3">
        <div className="col-5">
          <div className="embed-responsive embed-responsive-16by9">
            <img className="img-thumbnail product-thumbnail" src={imageUrl} alt="" />
          </div>
        </div>
        <div className="col-7">
          <h6 className="m-0" aria-level="3">{title}</h6>
          <p className="m-0">{this.renderCertificateType(certificateType, courseKey)}</p>
          {isNumEnrolledExperiment
            ? this.renderEnrollmentCount(courseKey, enrollmentCountData) : null}
        </div>
      </div>
    );
  }
}

ProductLineItem.propTypes = {
  isNumEnrolledExperiment: PropTypes.bool,
  enrollmentCountData: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    enrollment_count: PropTypes.number,
  })),
  imageUrl: PropTypes.string,
  title: PropTypes.string,
  certificateType: PropTypes.oneOf(['audit', 'honor', 'verified', 'no-id-professional', 'professional', 'credit']),
  courseKey: PropTypes.string,
};

ProductLineItem.defaultProps = {
  isNumEnrolledExperiment: false,
  enrollmentCountData: null,
  certificateType: undefined,
  title: null,
  imageUrl: null,
  courseKey: null,
};

export default injectIntl(ProductLineItem);
