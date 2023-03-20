import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import {
  reducer as paymentReducer,
  storeName as paymentStoreName,
} from '../payment';
import {
  reducer as subscriptionReducer,
  storeName as subscriptionStoreName,
} from '../subscription/data';
import {
  reducer as feedbackReducer,
  storeName as feedbackStoreName,
} from '../feedback';

const createRootReducer = () => combineReducers({
  [subscriptionStoreName]: subscriptionReducer,
  [paymentStoreName]: paymentReducer,
  [feedbackStoreName]: feedbackReducer,
  form: formReducer,
});

export default createRootReducer;
