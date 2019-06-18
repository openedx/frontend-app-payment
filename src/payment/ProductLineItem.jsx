import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from '@edx/frontend-i18n';


class ProductLineItem extends React.PureComponent {
  renderSeatType(seatType) {
    switch (seatType) {
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
      imgUrl,
      name,
      seatType,
    } = this.props;
    return (
      <div className="row align-items-center">
        <div className="col-5">
          <img className="img-thumbnail" src={imgUrl} alt={name} />
        </div>
        <div className="col-7">
          <h6 className="m-0">{name}</h6>
          <p className="m-0">{this.renderSeatType(seatType)}</p>
        </div>
      </div>
    );
  }
}

ProductLineItem.propTypes = {
  imgUrl: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  seatType: PropTypes.oneOf(['professional', 'no-id-professional', 'verified', 'honor', 'audit']),
};

ProductLineItem.defaultProps = {
  seatType: undefined,
};

export default injectIntl(ProductLineItem);
