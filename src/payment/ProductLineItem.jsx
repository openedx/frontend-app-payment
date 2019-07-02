import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from '@edx/frontend-i18n';


class ProductLineItem extends React.PureComponent {
  renderSeatType(certificateType) {
    switch (certificateType) {
      case 'professional':
      case 'no-id-professional':
        return (<FormattedMessage
          id="payment.productlineitem.professional.certificate"
          defaultMessage="Professional Certificate"
          description="Course certificate type on product details section"
        />);
      case 'Verified':
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
      imageUrl,
      title,
      certificateType,
    } = this.props;
    return (
      <div className="row align-items-center">
        <div className="col-5">
          <img className="img-thumbnail" src={imageUrl} alt={title} />
        </div>
        <div className="col-7">
          <h6 className="m-0">{title}</h6>
          <p className="m-0">{this.renderSeatType(certificateType)}</p>
        </div>
      </div>
    );
  }
}

ProductLineItem.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  certificateType: PropTypes.oneOf(['professional', 'no-id-professional', 'Verified', 'honor', 'audit']),
};

ProductLineItem.defaultProps = {
  certificateType: undefined,
};

export default injectIntl(ProductLineItem);
