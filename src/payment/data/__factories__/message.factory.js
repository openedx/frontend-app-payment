import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

import './product.factory';

Factory.define('info-message')
  .attrs({
    code: 'great-info-message',
    message_type: 'info',
    user_message: null,
    data: null,
  });

Factory.define('error-message')
  .attrs({
    code: 'scary-error-message',
    message_type: 'error',
    user_message: null,
    data: null,
  });
