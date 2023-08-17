// import FallbackErrorMessage from '../../feedback/FallbackErrorMessage';
import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { Hyperlink } from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

// eslint-disable-next-line import/prefer-default-export
export const EmbargoErrorMessage = () => (
  <FormattedMessage
    FormattedMessage
    id="subscription.alerts.error.embargo"
    defaultMessage="We're sorry, this program is not available in your region."
    description="Telling user that this program is not available in their region."
  >
    {text => <p aria-level="2">{text}</p>}
  </FormattedMessage>
);

export const ProgramUnavailableMessage = () => (
  <FormattedMessage
    id="subscription.alerts.error.program_unavailable"
    defaultMessage="Something went wrong, please reload the page. If the issue persists please {supportLink}."
    description="Inform user that something went wrong and they can not proceed with this program."
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

export const IneligibleProgramErrorMessage = () => (
  <FormattedMessage
    FormattedMessage
    id="subscription.alerts.error.ineligible_program"
    defaultMessage="We're sorry, this program is no longer offering a subscription option. Please search our catalog for current availability."
    description="Telling user that this program is not available for not available for subscription anymore."
  >
    {text => <p aria-level="2">{text}</p>}
  </FormattedMessage>
);

export const Unsuccessful3DSMessage = () => (
  <FormattedMessage
    FormattedMessage
    id="subscription.alerts.error.requires_payment_method"
    defaultMessage="We're sorry, the details you provided could not pass the 3D Secure check. Please try different payment details."
    description="Telling user that there was an error completing 3DS flow for purchasing a subscription."
  >
    {text => <p aria-level="2">{text}</p>}
  </FormattedMessage>
);

export default EmbargoErrorMessage;
