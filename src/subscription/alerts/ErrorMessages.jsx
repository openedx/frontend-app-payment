import FallbackErrorMessage from '../../feedback/FallbackErrorMessage';
import EmptyCartMessage from '../../payment/EmptyCartMessage';
// eslint-disable-next-line import/prefer-default-export
export const EmptySubscriptionMessage = () => (
  <>
    <FallbackErrorMessage />
    <EmptyCartMessage />
  </>
);
