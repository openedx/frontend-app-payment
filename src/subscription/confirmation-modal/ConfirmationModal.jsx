import React, { useState, useEffect } from 'react';

import {
  ModalDialog, ActionRow, Button, Hyperlink,
} from '@edx/paragon';
import { useSelector } from 'react-redux';
import { ArrowForward } from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { useIntl, defineMessages, FormattedMessage } from '@edx/frontend-platform/i18n';

import { subscriptionStatusSelector } from '../data/status/selectors';

import { detailsSelector } from '../data/details/selectors';

const messages = defineMessages({
  'subscription.confirmation.modal.trialing.heading': {
    id: 'subscription.confirmation.modal.trialing.heading',
    defaultMessage: 'Congratulations! Your 7-day free trial of {programTitle} has started.',
    description: 'Subscription trialing confirmation success heading.',
  },
  'subscription.confirmation.modal.trialing.body': {
    id: 'subscription.confirmation.modal.trialing.body',
    defaultMessage: "When your free trial ends, your subscription will begin, and we'll charge your payment method on file {price} {currency} per month. To avoid being charged, you must cancel before your trial expires. This subscription will automatically renew every month unless you cancel from the {ordersAndSubscriptionLink} page.",
    description: 'Subscription trialing confirmation success message explaining monthly subscription plan.',
  },
  'subscription.confirmation.modal.resubscribe.heading': {
    id: 'subscription.confirmation.modal.resubscribe.heading',
    defaultMessage: 'Congratulations! Your subscription to {programTitle} has started.',
    description: 'Subscription resubscribe confirmation success heading.',
  },
  'subscription.confirmation.modal.resubscribe.body': {
    id: 'subscription.confirmation.modal.resubscribe.body',
    defaultMessage: 'We charged your payment method {price} {currency}. This subscription will be automatically renewed and charged monthly unless you cancel from the {ordersAndSubscriptionLink} page.',
    description: 'Subscription resubscribe confirmation success message explaining monthly subscription plan.',
  },
  'subscription.confirmation.modal.body.orders.link': {
    id: 'subscription.confirmation.modal.body.orders.link',
    defaultMessage: 'Orders and Subscriptions',
    description: 'Subscription Orders & Subscriptions link placeholder.',
  },
});

/**
 * ConfirmationModal
 */
export const ConfirmationModal = () => {
  const {
    programTitle,
    price,
    currency,
    programUuid,
    isTrialEligible,
  } = useSelector(detailsSelector);
  const intl = useIntl();
  const { confirmationStatus } = useSelector(subscriptionStatusSelector);
  const [isOpen, setOpen] = useState(false);
  const subscriptionState = isTrialEligible ? 'trialing' : 'resubscribe';

  useEffect(() => {
    if (confirmationStatus === 'success') {
      setOpen(true);
    }
  }, [confirmationStatus]);

  const ordersAndSubscriptionLink = (
    <Hyperlink
      destination={getConfig().ORDER_HISTORY_URL}
    >
      {intl.formatMessage(messages['subscription.confirmation.modal.body.orders.link'])}
    </Hyperlink>
  );

  if (!isOpen) { return null; }

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
            intl.formatMessage(messages[`subscription.confirmation.modal.${subscriptionState}.heading`], {
              programTitle,
            })
          }
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {
          intl.formatMessage(messages[`subscription.confirmation.modal.${subscriptionState}.body`], {
            currency,
            price: intl.formatNumber(price, {
              style: 'currency',
              currency: currency || 'USD',
            }),
            ordersAndSubscriptionLink,
          })
        }
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <Button
            variant="brand"
            as="a"
            iconAfter={ArrowForward}
            href={`${getConfig().LMS_BASE_URL}/dashboard/programs/${programUuid}`}
          >
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

export default ConfirmationModal;
