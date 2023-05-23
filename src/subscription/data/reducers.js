import { combineReducers } from 'redux';

import details from './details/reducer';
import status from './status/reducer';

export const reducer = combineReducers({
  details,
  status,
});

export default reducer;
