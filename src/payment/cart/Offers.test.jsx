/* eslint-disable global-require */
import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-i18n';

import { configuration } from '../../environment';
import messages from '../../i18n';
import Offers from './Offers';

const mockStore = configureMockStore();
configureI18n(configuration, messages);
const baseState = { payment: { basket: {}, currency: {} } };

const renderWithProviders = children => renderer.create((
  <IntlProvider locale="en">
    <Provider store={mockStore(baseState)}>
      {children}
    </Provider>
  </IntlProvider>
));

describe('<Offers />', () => {
  it('renders nothing if not supplied a discount value', () => {
    const tree = renderWithProviders(<Offers />).toJSON();
    expect(tree).toBeNull();
  });

  it('renders a percentage offer', () => {
    const tree = renderWithProviders((
      <Offers
        offers={[
          { benefitValue: 50, benefitType: 'Percentage', provider: 'Pied Piper' },
        ]}
        discounts={10}
      />
    )).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a dynamic discount offer', () => {
    const tree = renderWithProviders((
      <Offers
        offers={[
          { benefitValue: 50, benefitType: 'Percentage', provider: null },
        ]}
        discounts={10}
      />
    )).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders an absolute value offer', () => {
    const tree = renderWithProviders((
      <Offers
        offers={[
          { benefitValue: 10, benefitType: 'Absolute', provider: 'Pied Piper' },
        ]}
        discounts={10}
      />
    )).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
