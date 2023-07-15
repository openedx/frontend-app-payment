import { sendTrackEvent } from '@edx/frontend-platform/analytics';

/**
 * sendSubscriptionEvent
 * Use this method to send Subscription success/failure segment events
 * @param {details, success}
 */
export const sendSubscriptionEvent = ({ details, success }) => {
  const eventType = success
    ? 'edx.bi.user.subscription.program.checkout.success'
    : 'edx.bi.user.subscription.program.checkout.failure';

  sendTrackEvent(
    eventType,
    {
      paymentProcessor: details.paymentMethod,
      isTrialEligible: details.isTrialEligible,
      isNewSubscription: details.isTrialEligible,
      programUuid: details.programUuid,
      price: details.price,
    },
  );
};

/**
 * handleCustomErrors
 * Use this method to format error code so our Alert service
 * could display it on the alerts
 * @param {error, fallbackKey}
 */
export const handleCustomErrors = (error, fallbackKey) => {
  const apiErrors = [{
    code: fallbackKey || error.cause,
    userMessage: error.message,
  }];
  const err = new Error();
  err.errors = apiErrors;
  return err;
};
