import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import Offers from './Offers';

const mockStore = configureMockStore();

const baseState = { payment: { basket: {} } };

const renderWithProviders = children => render((
  <IntlProvider locale="en">
    <Provider store={mockStore(baseState)}>
      {children}
    </Provider>
  </IntlProvider>
));

describe('<Offers />', () => {
  it('renders nothing if not supplied a discount value', () => {
    const { container: tree } = renderWithProviders(<Offers />);
    expect(tree.children.length).toBe(0);
  });

  it('renders a percentage offer', () => {
    const { container: tree } = renderWithProviders((
      <Offers
        offers={[
          { benefitValue: 50, benefitType: 'Percentage', provider: 'Pied Piper' },
        ]}
        discounts={10}
      />
    ));
    expect(tree).toMatchSnapshot();
  });

  it('renders a dynamic discount offer', () => {
    const { container: tree } = renderWithProviders((
      <Offers
        offers={[
          { benefitValue: 50, benefitType: 'Percentage', provider: null },
        ]}
        discounts={10}
      />
    ));
    expect(tree).toMatchSnapshot();
  });

  it('renders an absolute value offer', () => {
    const { container: tree } = renderWithProviders((
      <Offers
        offers={[
          { benefitValue: 10, benefitType: 'Absolute', provider: 'Pied Piper' },
        ]}
        discounts={10}
      />
    ));
    expect(tree).toMatchSnapshot();
  });
});
