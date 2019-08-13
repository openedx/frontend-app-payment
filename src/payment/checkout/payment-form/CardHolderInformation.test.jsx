/* eslint-disable global-require */
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { mount } from 'enzyme';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-i18n';

import { configuration } from '../../../environment';
import messages from '../../../i18n';
import CardHolderInformation, { CardHolderInformationComponent } from './CardHolderInformation';
import PaymentForm from './PaymentForm';

const mockStore = configureMockStore();
const storeMocks = {
  defaultState: require('../../__mocks__/defaultState.mockStore.js'), // eslint-disable-line global-require
};

configureI18n(configuration, messages);

describe('<CardHolderInformation />', () => {
  describe('handleSelectCountry', () => {
    it('updates state with selected country', () => {
      const wrapper = mount((
        <IntlProvider locale="en">
          <Provider store={mockStore(storeMocks.defaultState)}>
            <PaymentForm>
              <CardHolderInformation />
            </PaymentForm>
          </Provider>
        </IntlProvider>
      ));
      const cardHolderInformation = wrapper.find(CardHolderInformationComponent).first().instance();
      const eventMock = jest.fn();

      cardHolderInformation.handleSelectCountry(eventMock, 'US');

      expect(cardHolderInformation.state).toEqual({ selectedCountry: 'US' });
    });
  });
});
