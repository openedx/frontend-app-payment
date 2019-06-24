import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-i18n';

import { configuration } from '../environment';
import messages from '../i18n';

import ConnectedAlertList from './AlertList';

jest.mock('@edx/frontend-logging', () => ({
  logError: jest.fn(),
}));

configureI18n(configuration, messages);

const mockStore = configureMockStore();
const storeMocks = {
  defaultState: require('./__mocks__/defaultFeedbackState.mockStore.js'), // eslint-disable-line global-require
  messagesOfEachType: require('./__mocks__/messagesOfEachType.mockStore.js'), // eslint-disable-line global-require
};

describe('AlertList', () => {
  it('should be null by default', () => {
    const component = (
      <IntlProvider locale="en">
        <Provider store={mockStore(storeMocks.defaultState)}>
          <ConnectedAlertList intlMessages={{}} removeMessage={jest.fn()} />
        </Provider>
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render messages of each type', () => {
    const component = (
      <IntlProvider locale="en">
        <Provider store={mockStore(storeMocks.messagesOfEachType)}>
          <ConnectedAlertList
            intlMessages={{
              boo: {
                id: 'boo',
                defaultMessage: 'Boo indeed!',
                description: 'boooo',
              },
              gah_error: {
                id: 'gah_error',
                defaultMessage: 'Gah!  An error!',
                description: 'gaaaaah',
              },
            }}
            removeMessage={jest.fn()}
          />
        </Provider>
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
