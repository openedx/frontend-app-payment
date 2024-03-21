import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import PayPalButton from './PayPalButton';

describe('OrderDetails', () => {
  it('should render the button by default', () => {
    const component = (
      <IntlProvider locale="en">
        <PayPalButton />
      </IntlProvider>
    );
    const { container: tree } = render(component);
    expect(tree).toMatchSnapshot();
  });
  it('should render the button with a spinner when processing', () => {
    const component = (
      <IntlProvider locale="en">
        <PayPalButton isProcessing />
      </IntlProvider>
    );
    const { container: tree } = render(component);
    expect(tree).toMatchSnapshot();
  });
});
