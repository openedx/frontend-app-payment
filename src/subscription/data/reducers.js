import { combineReducers } from 'redux';

import subscription from './details/reducer';
import clientSecret from './client-secret/reducer';

export const reducer = combineReducers({
  details: subscription,
  clientSecret,
});

export default reducer;
