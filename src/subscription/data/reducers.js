import { combineReducers } from 'redux';

import details from './details/reducer';

export const reducer = combineReducers({
  details,
});

export default reducer;
