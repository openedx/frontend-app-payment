import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ModalDialog, ActionRow, Button, Hyperlink,
} from '@edx/paragon';
import { useSelector } from 'react-redux';
import { ArrowForward } from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { useIntl, defineMessages, FormattedMessage } from '@edx/frontend-platform/i18n';
import { detailsSelector } from '../data/details/selectors';

const messages = defineMessages({
  'subscription.confirmation.modal.heading': {
    id: 'subscription.confirmation.modal.heading',
    defaultMessage: 'Congratulations! Your 7-day free trial of {programTitle} has started.',
    description: 'Subscription confirmation success heading.',
  },
  'subscription.confirmation.modal.body': {
    id: 'subscription.confirmation.modal.body',
    defaultMessage: "When your free trial ends, your subscription will begin, and we'll charge your payment method on file {price} per month plus any applicable taxes. This subscription will automatically renew every month unless you cancel from the {ordersAndSubscriptionLink} page.",
    description: 'Subscription confirmation success message explaining monthly subscription plan.',
  },
  'subscription.confirmation.modal.body.orders.link': {
    id: 'subscription.confirmation.modal.body.orders.link',
    defaultMessage: 'Orders & Subscriptions',
    description: 'Subscription Orders & Subscriptions link placeholder.',
  },
});

/**
 * ConfirmationModal
 */
export const ConfirmationModal = ({ isVisible }) => {
  const [isOpen] = useState(isVisible);
  const { details } = useSelector(detailsSelector);

  const intl = useIntl();
  // TODO: add the redirect URL logic for `Goto Dashboard` button
  const ordersAndSubscriptionLink = (
    <Hyperlink
      destination={getConfig().ORDER_HISTORY_URL}
    >
      {intl.formatMessage(messages['subscription.confirmation.modal.body.orders.link'])}
    </Hyperlink>
  );
  return (
    <ModalDialog
      title="Subscription Confirmation Dialog"
      isOpen={isOpen}
      onClose={() => {}}
      hasCloseButton={false}
      isFullscreenOnMobile={false}
      className="confirmation-modal"
    >
      <ModalDialog.Header>
        <ModalDialog.Title as="h3">
          {
            intl.formatMessage(messages['subscription.confirmation.modal.heading'], {
              programTitle: details.programTitle,
            })
          }
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {
          intl.formatMessage(messages['subscription.confirmation.modal.body'], {
            price: intl.formatNumber(details.price, { style: 'currency', currency: 'USD' }),
            ordersAndSubscriptionLink,
          })
        }
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <Button variant="brand" iconAfter={ArrowForward}>
            <FormattedMessage
              id="subscription.confirmation.modal.navigation.title"
              defaultMessage="Go to dashboard"
              description="Subscription confirmation success button title."
            />
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

ConfirmationModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
};

export default ConfirmationModal;
