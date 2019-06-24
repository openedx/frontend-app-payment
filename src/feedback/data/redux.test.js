import { createStore, combineReducers } from 'redux';

import reducer, { resetIds } from './reducers';
import { addMessage, removeMessage } from './actions';
import { DANGER, INFO } from './constants';
import { messageListSelector, alertListMapStateToProps, fieldMessagesSelector } from './selectors';

describe('redux tests', () => {
  let store;
  beforeEach(() => {
    store = createStore(combineReducers({ feedback: reducer }));
    resetIds();
  });

  it('should return the default state when appropriate', () => {
    // Its base state
    expect(store.getState().feedback).toMatchSnapshot();

    // If an action isn't appropriate for it
    store.dispatch({ type: 'SOMETHING_ELSE' });
    expect(store.getState().feedback).toMatchSnapshot();

    // When called with no parameters
    expect(reducer()).toMatchSnapshot();
  });

  it('should select the right data', () => {
    // Selectors
    let result = messageListSelector(store.getState());
    expect(result).toEqual([]);

    result = alertListMapStateToProps(store.getState());
    expect(result).toEqual({ messageList: [] });

    result = fieldMessagesSelector(store.getState(), { name: 'boo' });
    expect(result).toEqual([]);
  });

  describe('addMessage action', () => {
    it('should add a code-based message', () => {
      store.dispatch(addMessage('boo', null, { needed: 'data' }, DANGER));
      expect(store.getState().feedback.byId).toEqual({
        0: {
          id: 0,
          code: 'boo',
          message: null,
          data: { needed: 'data' },
          severity: DANGER,
          fieldName: null,
        },
      });
      expect(store.getState().feedback.orderedIds).toEqual([0]);

      store.dispatch(addMessage('boo_again', null, { needed: 'data1' }, INFO));
      expect(store.getState().feedback.byId).toEqual({
        0: {
          id: 0,
          code: 'boo',
          message: null,
          data: { needed: 'data' },
          severity: DANGER,
          fieldName: null,
        },
        1: {
          id: 1,
          code: 'boo_again',
          message: null,
          data: { needed: 'data1' },
          severity: INFO,
          fieldName: null,
        },
      });
      expect(store.getState().feedback.orderedIds).toEqual([0, 1]);
    });

    it('should add user_message-based message', () => {
      store.dispatch(addMessage(null, 'oh no oh no', {}, DANGER));
      expect(store.getState().feedback.byId).toEqual({
        0: {
          id: 0,
          code: null,
          message: 'oh no oh no',
          data: {},
          severity: DANGER,
          fieldName: null,
        },
      });
    });

    it('should add field-based message', () => {
      store.dispatch(addMessage(null, 'oh no oh no', {}, DANGER, 'cats'));
      expect(store.getState().feedback.byId).toEqual({
        0: {
          id: 0,
          code: null,
          message: 'oh no oh no',
          data: {},
          severity: DANGER,
          fieldName: 'cats',
        },
      });
    });

    it('should select the messages', () => {
      store.dispatch(addMessage('boo', null, { needed: 'data' }, DANGER));
      store.dispatch(addMessage('boo2', null, { needed: 'data2' }, DANGER, 'bah'));

      const expectedMessageList = [
        {
          id: 0,
          code: 'boo',
          message: null,
          data: { needed: 'data' },
          severity: DANGER,
          fieldName: null,
        },
        {
          id: 1,
          code: 'boo2',
          message: null,
          data: { needed: 'data2' },
          severity: DANGER,
          fieldName: 'bah',
        },
      ];

      let result = messageListSelector(store.getState());
      expect(result).toEqual(expectedMessageList);

      result = alertListMapStateToProps(store.getState());
      expect(result).toEqual({ messageList: expectedMessageList });

      result = fieldMessagesSelector(store.getState(), { name: 'bah' });
      expect(result).toEqual([{
        id: 1,
        code: 'boo2',
        message: null,
        data: { needed: 'data2' },
        severity: DANGER,
        fieldName: 'bah',
      }]);
    });
  });

  describe('removeMessage action', () => {
    beforeEach(() => {
      store.dispatch(addMessage('boo0', null, null, INFO));
    });

    it('should remove the only message present', () => {
      store.dispatch(removeMessage(0));
      expect(store.getState().feedback).toEqual({
        byId: {},
        orderedIds: [],
      });
    });

    it('should remove the first message', () => {
      store.dispatch(addMessage('boo1', null, null, INFO));
      store.dispatch(addMessage('boo2', null, null, INFO));
      store.dispatch(removeMessage(0));
      expect(store.getState().feedback).toEqual({
        byId: {
          1: {
            id: 1,
            code: 'boo1',
            message: null,
            data: null,
            severity: INFO,
            fieldName: null,
          },
          2: {
            id: 2,
            code: 'boo2',
            message: null,
            data: null,
            severity: INFO,
            fieldName: null,
          },
        },
        orderedIds: [1, 2],
      });
    });

    it('should remove the middle message', () => {
      store.dispatch(addMessage('boo1', null, null, INFO));
      store.dispatch(addMessage('boo2', null, null, INFO));
      store.dispatch(removeMessage(1));
      expect(store.getState().feedback).toEqual({
        byId: {
          0: {
            id: 0,
            code: 'boo0',
            message: null,
            data: null,
            severity: INFO,
            fieldName: null,
          },
          2: {
            id: 2,
            code: 'boo2',
            message: null,
            data: null,
            severity: INFO,
            fieldName: null,
          },
        },
        orderedIds: [0, 2],
      });
    });

    it('should remove the last message', () => {
      store.dispatch(addMessage('boo1', null, null, INFO));
      store.dispatch(addMessage('boo2', null, null, INFO));
      store.dispatch(removeMessage(2));
      expect(store.getState().feedback).toEqual({
        byId: {
          0: {
            id: 0,
            code: 'boo0',
            message: null,
            data: null,
            severity: INFO,
            fieldName: null,
          },
          1: {
            id: 1,
            code: 'boo1',
            message: null,
            data: null,
            severity: INFO,
            fieldName: null,
          },
        },
        orderedIds: [0, 1],
      });
    });
  });
});
