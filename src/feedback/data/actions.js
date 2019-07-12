export const ADD_MESSAGE = 'ADD_MESSAGE';
export const REMOVE_MESSAGE = 'REMOVE_MESSAGE';

export const addMessage = (code, userMessage, data, messageType, fieldName = null) => ({
  type: ADD_MESSAGE,
  payload: {
    code,
    userMessage,
    data,
    messageType,
    fieldName,
  },
});

export const removeMessage = id => ({
  type: REMOVE_MESSAGE,
  payload: {
    id,
  },
});
