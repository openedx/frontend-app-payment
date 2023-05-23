/**
 * getStripeOptions
 * @param {string} clientSecretId use to initial stripe
 * @returns stripe options
 */
export const getStripeOptions = ({ currency, price }) => ({
  // Stripe element config
  mode: 'subscription',
  /**
   * NOTE: this is important to set the right subscription price as defined within stripe subscription
   * otherwise card details will not load properly
   * https://dashboard.stripe.com/test/subscriptions/sub_1Mtd3sH4caH7G0X1dvzlMT3o
   * Stripe consider amount in cents and we need to convert and the minimum amount it expects is 0.50 cents
   * https://stripe.com/docs/currencies#zero-decimal
   * */
  amount: (price * 100),
  currency: currency && currency.toLowerCase(),
  paymentMethodCreation: 'manual',
  appearance: {
    /**
     * Normally these styling values would come from Paragon,
     * however since stripe requires styling to be passed
     * in through the appearance object they are currently placed here.
     * TODO: Investigate if these values can be pulled into javascript from the Paragon css files
     * If we really want to use scss variables in JS we can look for this article, but that would require
     * proper build setup, ig
     * https://css-tricks.com/getting-javascript-to-talk-to-css-and-sass/
     */
    rules: {
      '.Input': {
        border: 'solid 1px #707070', // $gray-500
        borderRadius: '0',
        fontSize: '1.125rem',
        lineHeight: '1.33334rem',
      },
      '.Input--invalid': {
        border: '1px solid #D23228',
        boxShadow: 'none',
      },
      '.Input:hover': {
        border: '1px solid #1f3226',
      },
      '.Input:focus': {
        color: '#454545',
        backgroundColor: '#FFFFFF', // $white
        borderColor: '#0A3055', // $primary
        outline: '0',
        boxShadow: '0 0 0 1px #0A3055', // $primary
      },
      '.Label': {
        fontSize: '1.125rem',
        fontFamily: 'Inter,Helvetica Neue,Arial,sans-serif',
        fontWeight: '400',
        marginBottom: '0.5rem',
        color: '#454545',
      },
      '.Error': {
        fontSize: '0.875rem',
        fontWeight: 400,
        color: '#D23228',
      },
      '.Text--terms': {
        fontFamily: 'Inter,Helvetica Neue,Arial,sans-serif',
        fontWeight: '400',
        color: '#454545',
        fontSize: '18px',
        lineHeight: '28px',
      },
    },
  },
  fields: {
    billingDetails: {
      address: 'never',
    },
  },
});

export default getStripeOptions;
