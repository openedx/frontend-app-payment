import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-i18n';
import { connect } from 'react-redux';
import { Hyperlink } from '@edx/paragon';

const FallbackErrorMessage = ({ supportURL }) => (
  <FormattedMessage
    id="payment.error.fetch.basket"
    defaultMessage="There was an unexpected problem. If the problem persists, please {supportLink}."
    description="The error message when a basket fails to load"
    values={{
      supportLink: (
        <Hyperlink destination={supportURL}>
          <FormattedMessage
            id="payment.error.fetch.basket.support.fragment"
            defaultMessage="contact support"
            description="The support link as in 'please {contact support}'"
          />
        </Hyperlink>
      ),
    }}
  />
);

FallbackErrorMessage.propTypes = {
  supportURL: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  supportURL: state.configuration.SUPPORT_URL,
});

export default connect(mapStateToProps)(FallbackErrorMessage);
