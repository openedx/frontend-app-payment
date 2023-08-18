import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies
// import Chance from 'chance'; // eslint-disable-line import/no-extraneous-dependencies

import '../../payment/__factories__/product.factory';
import '../../payment/__factories__/message.factory';

Factory.define('subscription')
  .sequence('subscription_id')
  .option('numProducts', 0)
  .option('productType', 'Course Entitlement')
  .option('numErrorMessages', 0)
  .option('numInfoMessages', 0)
  .attrs({
    program_uuid: '00000000-0000-0000-0000-00000000001c',
    is_trial_eligible: true,
    program_title: 'Blockchain Fundamentals',
    organizations: ['University of California, Berkeley'],
    program_type: 'Professional Certificate',
    price: 55.00,
    total_price: 0,
    currency: 'USD',
    paymentMethod: 'stripe',
    trial_end: '2023-06-29T13:05:04Z',
    error_code: null,
  })
  .attr('products', ['numProducts', 'productType'], (numProducts, productType) => {
    const products = [];
    for (let i = 0; i < numProducts; i++) { // eslint-disable-line no-plusplus
      products.push(Factory.build('course-product', {}, { productType }));
    }
    return products;
  })
  .attr('messages', ['numErrorMessages', 'numInfoMessages'], (numErrorMessages, numInfoMessages) => {
    const messages = [];
    for (let i = 0; i < numErrorMessages; i++) { // eslint-disable-line no-plusplus
      messages.push(Factory.build('error-message'));
    }
    for (let i = 0; i < numInfoMessages; i++) { // eslint-disable-line no-plusplus
      messages.push(Factory.build('info-message'));
    }
    return messages;
  });
