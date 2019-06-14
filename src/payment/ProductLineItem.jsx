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
      case 'verified-certificate':
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
      <div className="pb-3">
        <h2 className="h6">
          <FormattedMessage
            id="payment.productlineitem.purchase.cart.heading"
            defaultMessage="In your cart"
            description="Heading of the cart in product details section"
          />
        </h2>
        <p>
          <FormattedMessage
            id="payment.productlineitem.purchase.cart.subheading"
            defaultMessage="Your purchase contains the following:"
            description="Subheading of the cart in product details section"
          />
        </p>
        <div className="row align-items-center">
          <div className="col-5">
            <img className="img-thumbnail mb-3" src={imgUrl} alt={name} />
          </div>
          <div className="col-7">
            <p className="h6">
              {name}
            </p>
            <p>{this.renderSeatType(seatType)}</p>
          </div>
        </div>
      </div>
    );
  }
}

ProductLineItem.propTypes = {
  imgUrl: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  seatType: PropTypes.oneOf(['professional', 'no-id-professional', 'verified-certificate', 'honor', 'audit']),
};

ProductLineItem.defaultProps = {
  seatType: undefined,
};

export default injectIntl(ProductLineItem);
