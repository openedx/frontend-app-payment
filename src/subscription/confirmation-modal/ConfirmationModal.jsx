import React, { useState, useEffect } from 'react';

import {
  ModalDialog, ActionRow, Button, Hyperlink,
} from '@edx/paragon';
import { useSelector } from 'react-redux';
import { ArrowForward } from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';

import { subscriptionStatusSelector } from '../data/status/selectors';

import { detailsSelector } from '../data/details/selectors';
import { getPropsToRemoveFractionZeroDigits } from '../../payment/data/utils';

import { messages } from './messages';

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
  const { status } = useSelector(subscriptionStatusSelector);
  const [isOpen, setOpen] = useState(false);
  const subscriptionState = isTrialEligible ? 'trialing' : 'resubscribe';

  useEffect(() => {
    if (status === 'succeeded' || status === 'trialing') {
      setOpen(true);
    }
  }, [status]);

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
              ...getPropsToRemoveFractionZeroDigits({ price, shouldRemoveFractionZeroDigits: true }),
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
