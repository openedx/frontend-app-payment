import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from '@edx/frontend-i18n';


class ProductLineItem extends React.PureComponent {
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

  renderCertificateType(certificateType) {
    switch (certificateType) {
      case 'professional':
      case 'no-id-professional':
        return (<FormattedMessage
          id="payment.productlineitem.professional.certificate"
          defaultMessage="Professional Certificate"
          description="Course certificate type on product details section"
        />);
      case 'verified':
        return (<FormattedMessage
          id="payment.productlineitem.verified.certificate"
          defaultMessage="Verified Certificate"
          description="Course certificate type on product details section"
        />);
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
          <p className="m-0">{this.renderCertificateType(certificateType)}</p>
          {isNumEnrolledExperiment ?
            this.renderEnrollmentCount(courseKey, enrollmentCountData) : null
          }
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
