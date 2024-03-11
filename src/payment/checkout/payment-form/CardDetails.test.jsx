/* eslint-disable global-require */
import React from 'react';
import { render } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import { reduxForm } from 'redux-form';

import { CardDetailsComponent } from './CardDetails';

const mockStore = configureMockStore();

describe('<CardDetails />', () => {
  it('exists', () => {
    const cardDetails = render(reduxForm(
      <IntlProvider locale="en">
        <Provider
          store={mockStore()}
        >
          <CardDetailsComponent />
        </Provider>
      </IntlProvider>,
    ));
    expect(cardDetails.container).toBeTruthy();
  });
});
