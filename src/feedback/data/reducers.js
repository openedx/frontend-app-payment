import without from 'lodash.without';

import { ADD_MESSAGE, REMOVE_MESSAGE, CLEAR_MESSAGES } from './actions';

export const storeName = 'feedback';

const defaultState = {
  byId: {},
  orderedIds: [],
};

let lastId = 0;

function getNextId() {
  return lastId++; // eslint-disable-line no-plusplus
}

export function resetIds() {
  lastId = 0;
}

const addMessage = (state, action) => {
  const id = getNextId();
  return {
    byId: {
      ...state.byId,
      [id]: {
        id,
        ...action.payload, // code, userMessage, data, messageType, fieldName
      },
    },
    orderedIds: [...state.orderedIds, id],
  };
};

const removeMessage = (state, action) => {
  const byId = { ...state.byId };
  delete byId[action.payload.id];
  return {
    byId,
    orderedIds: without([...state.orderedIds], action.payload.id),
  };
};

const reducer = (state = defaultState, action = null) => {
  if (action !== null) {
    switch (action.type) {
      case ADD_MESSAGE:
        return addMessage(state, action);
      case REMOVE_MESSAGE:
        return removeMessage(state, action);
      case CLEAR_MESSAGES:
        return defaultState;
      default:
    }
  }
  return state;
};

export default reducer;
