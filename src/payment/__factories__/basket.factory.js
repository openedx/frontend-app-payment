import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies
import Chance from 'chance'; // eslint-disable-line import/no-extraneous-dependencies

import './product.factory';
import './message.factory';

const chance = new Chance(12345);

Factory.define('basket')
  .sequence('basket_id')
  .option('numProducts', 0)
  .option('productType', 'Course Entitlement')
  .option('numErrorMessages', 0)
  .option('numInfoMessages', 0)
  .attrs({
    summary_price: 0.0,
    order_total: 0.0,
    summary_subtotal: 0.0,
    summary_discounts: 0.0,
    show_coupon_form: false,
    is_free_basket: false,
    currency: 'USD',
    offers: [],
    coupons: [],
  })
  .attr('products', ['numProducts', 'productType'], (numProducts, productType) => {
    const products = [];
    for (let i = 0; i < numProducts; i++) { // eslint-disable-line no-plusplus
      products.push(Factory.build('course-product', {}, { productType }));
    }
    return products;
  })
  .attr('summary_quantity', ['numProducts'], numProducts => numProducts)
  .attr('messages', ['numErrorMessages', 'numInfoMessages'], (numErrorMessages, numInfoMessages) => {
    const messages = [];
    for (let i = 0; i < numErrorMessages; i++) { // eslint-disable-line no-plusplus
      messages.push(Factory.build('error-message'));
    }
    for (let i = 0; i < numInfoMessages; i++) { // eslint-disable-line no-plusplus
      messages.push(Factory.build('info-message'));
    }
    return messages;
  })
  .attr('summary_price', () => chance.floating({ min: 1, max: 500, fixed: 2 }))
  .attr('summary_subtotal', ['summary_price'], summaryPrice => summaryPrice)
  .attr('order_total', ['summary_price'], summaryPrice => summaryPrice);
