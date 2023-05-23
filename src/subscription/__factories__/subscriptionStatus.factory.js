import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

Factory.define('subscriptionStatus')
  .attrs({
    confirmation_client_secret: '3asd-3nk3-2kl3-kl32-32lw',
    status: 'success', // CONFIRMATION_STATUS.succeeded,
    subscription_id: 'SUB_in32n32ds',
    price: 79.00,

    // 3DS
    submitting: false,
    submitted: false,
  });
