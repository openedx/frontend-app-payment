import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { render, act } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { logInfo } from '@edx/frontend-platform/logging';

import createRootReducer from '../data/reducers';
import PageLoadingDynamicPaymentMethods from './PageLoadingDynamicPaymentMethods';

jest.mock('@edx/frontend-platform/logging', () => ({
  logInfo: jest.fn(),
}));

describe('PageLoadingDynamicPaymentMethods', () => {
  let store;

  beforeEach(() => {
    store = createStore(createRootReducer());
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders <PageLoadingDynamicPaymentMethods />', () => {
    const component = (
      <IntlProvider locale="en">
        <Provider store={store}>
          <PageLoadingDynamicPaymentMethods
            srMessage=""
            orderNumber="EDX-100001"
          />
        </Provider>
      </IntlProvider>
    );
    const { container: tree } = render(component);
    expect(tree).toMatchSnapshot();
  });

  it('it redirects to receipt page after 3 seconds delay', () => {
    const orderNumber = 'EDX-100001';
    const logMessage = `Dynamic Payment Methods payment succeeded for edX order number ${orderNumber}, redirecting to ecommerce receipt page.`;
    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <PageLoadingDynamicPaymentMethods
            srMessage=""
            orderNumber={orderNumber}
          />
        </Provider>
      </IntlProvider>,
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(logInfo).toHaveBeenCalledWith(expect.stringMatching(logMessage));
  });

  it('cleans up the timer on unmount', () => {
    const { unmount } = render(
      <PageLoadingDynamicPaymentMethods
        srMessage=""
        orderNumber="EDX-100001"
      />,
    );
    unmount();
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(logInfo).not.toHaveBeenCalled();
  });
});
