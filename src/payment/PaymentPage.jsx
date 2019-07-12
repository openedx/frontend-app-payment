import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-i18n';
import { Hyperlink } from '@edx/paragon';

import messages from './PaymentPage.messages';
import { messages as couponMessages } from './coupon';

// Actions
import { fetchBasket } from './data/actions';

// Selectors
import { paymentSelector } from './data/selectors';

// Components
import { PageLoading } from '../common';
import BasketSummary from './BasketSummary';
import OrderDetails from './order-details';
import PaymentForm from './PaymentForm';
import PlaceOrderButton from './PlaceOrderButton';
import PaymentMethodSelect from './PaymentMethodSelect';
import ProductLineItems from './ProductLineItems';
import AlertList, { AlertMessageTemplate } from '../feedback/AlertList';

class PaymentPage extends React.Component {
  componentDidMount() {
    this.props.fetchBasket();
  }

  renderEmptyMessage() {
    const {
      dashboardURL,
      supportURL,
    } = this.props;

    return (
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">
            <FormattedMessage
              id="payment.empty.basket.heading"
              defaultMessage="Your basket is empty."
              description="The heading displayed when there is no basket"
            />
          </h5>
          <p className="card-text">
            <FormattedMessage
              id="payment.empty.basket.message"
              defaultMessage="If you attempted to make a purchase, you have not been charged. Return to your {actionLinkOne} to try again, or {actionLinkTwo}."
              description="The message displayed when there is no basket. Action links will redirect to dashboard or support page"
              values={{
              actionLinkOne: (
                <Hyperlink destination={dashboardURL}>
                  <FormattedMessage
                    id="payment.empty.basket.dashboardURL"
                    defaultMessage="dashboard"
                    description="The message displayed on the redirect to dashboard link"
                  />
                </Hyperlink>
              ),
              actionLinkTwo: (
                <Hyperlink destination={supportURL}>
                  <FormattedMessage
                    id="payment.empty.basket.supportURL"
                    defaultMessage="contact edX E-commerce Support"
                    description="The message displayed on the redirect to support page link"
                  />
                </Hyperlink>
              ),
            }}
            />
          </p>
        </div>
      </div>
    );
  }

  renderLoading() {
    return (
      <PageLoading srMessage={this.props.intl.formatMessage(messages['payment.loading.payment'])} />
    );
  }

  renderBasket() {
    const {
      isFreeBasket,
    } = this.props;

    return (
      <div className="row">
        <div className="col-md-5 pr-md-5 col-basket-summary">
          <ProductLineItems />
          <BasketSummary />
          <OrderDetails />
        </div>
        <div className="col-md-7 pl-md-5">
          {isFreeBasket ? <PlaceOrderButton /> : (
            <React.Fragment>
              <PaymentMethodSelect />
              <PaymentForm />
            </React.Fragment>
        )}
        </div>
      </div>
    );
  }

  render() {
    const {
      loading,
      loaded,
      isEmpty,
    } = this.props;

    return (
      <div className="page__payment container-fluid py-5">
        <AlertList messagePrefix="payment.messages." intlMessages={Object.assign({}, messages, couponMessages)}>
          <AlertMessageTemplate code="enrollment-code-product-info">
            <React.Fragment>
              <FormattedMessage
                id="payment.messages.enrollment-code-product-info.header"
                defaultMessage="Purchasing just for yourself?"
                description="Asks the user if they are purchasing a course for themselves."
                tagName="strong"
              />
              <FormattedMessage
                id="payment.messages.enrollment-code-product-info.body"
                defaultMessage="If you are purchasing a single code for someone else, please continue with checkout. However, if you are the learner {link}."
                description="Asks the user if they are purchasing a course for themselves and includes a link for them to click on if they are.  The link text is in 'payment.messages.enrollment-code-product-info.link' and should make sense, contextually, with this message."
                tagName="p"
                values={{
                  link: (
                    <Hyperlink destination={this.props.courseAboutUrl}>
                      {this.props.intl.formatMessage(messages['payment.messages.enrollment-code-product-info.link'])}
                    </Hyperlink>
                  ),
                }}
              />
            </React.Fragment>
          </AlertMessageTemplate>
        </AlertList>
        {loading ? this.renderLoading() : null}
        {isEmpty ? this.renderEmptyMessage() : null}
        {loaded && !isEmpty ? this.renderBasket() : null}
      </div>
    );
  }
}

PaymentPage.propTypes = {
  intl: intlShape.isRequired,
  isFreeBasket: PropTypes.bool,
  isEmpty: PropTypes.bool,
  loaded: PropTypes.bool,
  loading: PropTypes.bool,
  dashboardURL: PropTypes.string.isRequired,
  supportURL: PropTypes.string.isRequired,
  fetchBasket: PropTypes.func.isRequired,
  courseAboutUrl: PropTypes.string,
};

PaymentPage.defaultProps = {
  isFreeBasket: false,
  loaded: false,
  loading: false,
  isEmpty: false,
  courseAboutUrl: 'ugh',
};

export default connect(
  paymentSelector,
  {
    fetchBasket,
  },
)(injectIntl(PaymentPage));
