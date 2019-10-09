import React from 'react';
import { App } from '@edx/frontend-base';
import { FormattedMessage } from '@edx/frontend-i18n';
import { Hyperlink } from '@edx/paragon';

const FallbackErrorMessage = () => (
  <FormattedMessage
    id="payment.error.fetch.basket"
    defaultMessage="There was an unexpected problem. If the problem persists, please {supportLink}."
    description="The error message when a basket fails to load"
    values={{
      supportLink: (
        <Hyperlink destination={App.config.SUPPORT_URL}>
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


export default FallbackErrorMessage;
