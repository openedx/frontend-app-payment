import { createSelector } from 'reselect';

import { storeName } from './reducers';

const messagesSelector = state => state[storeName];

export const messageListSelector = createSelector(
  messagesSelector,
  messages => messages.orderedIds.map(id => messages.byId[id]),
);

export const alertListMapStateToProps = createSelector(
  messageListSelector,
  messageList => ({
    messageList,
  }),
);

const messagesAsArraySelector = createSelector(
  messagesSelector,
  messages => Object.values(messages.byId),
);

const fieldNameSelector = (state, props) => props.name;

/**
 * In order to use this selector, a component must have a string "name" prop that tells the selector
 * which field to return the messages for.
 */
export const fieldMessagesSelector = createSelector(
  fieldNameSelector,
  messagesAsArraySelector,
  (fieldName, messages) => {
    const fieldMessages = [];
    messages.forEach((message) => {
      if (message.fieldName === fieldName) {
        fieldMessages.push(message);
      }
    });
    return fieldMessages;
  },
);
