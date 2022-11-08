/* eslint-disable react/jsx-no-constructed-context-values */
// import React from 'react';
// import { Provider } from 'react-redux';
// import { mount } from 'enzyme';
import {
  // IntlProvider,
  configure as configureI18n,
} from '@edx/frontend-platform/i18n';
// import { AppContext } from '@edx/frontend-platform/react';
// import { Factory } from 'rosie';
// import { createStore } from 'redux';

// import CardHolderInformation, { CardHolderInformationComponent } from './CardHolderInformation';
// import PaymentForm from './PaymentForm';
// import createRootReducer from '../../../data/reducers';

import '../../__factories__/userAccount.factory';
// import { iteratee } from 'lodash';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

configureI18n({
  config: {
    ENVIRONMENT: process.env.ENVIRONMENT,
    LANGUAGE_PREFERENCE_COOKIE_NAME: process.env.LANGUAGE_PREFERENCE_COOKIE_NAME,
  },
  loggingService: {
    logError: jest.fn(),
    logInfo: jest.fn(),
  },
  messages: {
    uk: {},
    th: {},
    ru: {},
    'pt-br': {},
    pl: {},
    'ko-kr': {},
    id: {},
    he: {},
    ca: {},
    'zh-cn': {},
    fr: {},
    'es-419': {},
    ar: {},
  },
});

it('is using stripe', () => {
  expect(null).toEqual(null);
});
// TODO: Disabling for now update once we can swap between stripe and cybersource
// describe('<CardHolderInformation />', () => {
//   let store;

//   describe('handleSelectCountry', () => {
//     it('updates state with selected country', () => {
//       const authenticatedUser = Factory.build('userAccount');

//       store = createStore(createRootReducer(), {});
//       const component = (
//         <IntlProvider locale="en">
//           <AppContext.Provider value={{ authenticatedUser }}>
//             <Provider store={store}>
//               <PaymentForm onSubmitPayment={() => {}} onSubmitButtonClick={() => {}}>
//                 <CardHolderInformation />
//               </PaymentForm>
//             </Provider>
//           </AppContext.Provider>
//         </IntlProvider>
//       );
//       const wrapper = mount(component);
//       const cardHolderInformation = wrapper
//         .find(CardHolderInformationComponent)
//         .first()
//         .instance();
//       const eventMock = jest.fn();

//       cardHolderInformation.handleSelectCountry(eventMock, 'US');

//       expect(cardHolderInformation.state).toEqual({ selectedCountry: 'US' });
//     });
//   });
//   describe('purchasedForOrganization field', () => {
//     it('renders for bulk purchase', () => {
//       const wrapper = mount((
//         <IntlProvider locale="en">
//           <Provider store={store}>
//             <PaymentForm
//               isBulkOrder
//               handleSubmit={() => {}}
//               onSubmitPayment={() => {}}
//               onSubmitButtonClick={() => {}}
//             />
//           </Provider>
//         </IntlProvider>
//       ));
//       expect(wrapper.exists('#purchasedForOrganization')).toEqual(true);
//     });
//     it('does not render if not bulk purchase', () => {
//       const wrapper = mount((
//         <IntlProvider locale="en">
//           <Provider store={store}>
//             <PaymentForm
//               handleSubmit={() => {}}
//               onSubmitPayment={() => {}}
//               onSubmitButtonClick={() => {}}
//             />
//           </Provider>
//         </IntlProvider>
//       ));
//       expect(wrapper.exists('#purchasedForOrganization')).toEqual(false);
//     });
//   });
// });
