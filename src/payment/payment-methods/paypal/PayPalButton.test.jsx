import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider } from '@edx/frontend-i18n';

import PayPalButton from './PayPalButton';

describe('OrderDetails', () => {
  it('should render the button by default', () => {
    const component = (
      <IntlProvider locale="en">
        <PayPalButton />
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should render the button with a spinner when processing', () => {
    const component = (
      <IntlProvider locale="en">
        <PayPalButton isProcessing />
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
