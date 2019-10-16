import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-i18n';

import Offers from './Offers';

const mockStore = configureMockStore();

const baseState = { payment: { basket: {} } };

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
