import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@openedx/paragon';

const FallbackErrorMessage = () => (
  <FormattedMessage
    id="payment.error.fetch.basket"
    defaultMessage="There was an unexpected problem. If the problem persists, please {supportLink}."
    description="The error message when a basket fails to load"
    values={{
      supportLink: (
        <Hyperlink destination={getConfig().SUPPORT_URL}>
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
