import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies
import Chance from 'chance'; // eslint-disable-line import/no-extraneous-dependencies

const chance = new Chance(12345);

Factory.define('course-product')
  .option('productType', 'Course Entitlement')
  .attrs({
    sku: () => chance.string({ pool: 'abcdefg1234567890', length: 7 }),
    title: () => `Introduction to ${chance.animal()}s`,
    course_key: () => chance.string({ pool: 'abcdefg1234567890-:+' }),
    certificate_type: () => 'verified',
    image_url: () => chance.url({ protocol: 'https', domain: 'edx.org', extensions: ['gif', 'jpg', 'png'] }),
  })
  .attr('product_type', ['productType'], productType => productType);
