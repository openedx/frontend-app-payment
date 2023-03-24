import { combineReducers } from 'redux';

import details from './details/reducer';
import clientSecret from './client-secret/reducer';

export const reducer = combineReducers({
  details,
  clientSecret,
});

export default reducer;
