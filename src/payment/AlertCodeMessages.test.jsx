import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-i18n';

import { configuration } from '../environment';
import messages from '../i18n';
import {
  SingleEnrollmentCodeWarning,
  EnrollmentCodeQuantityUpdated,
} from './AlertCodeMessages';

configureI18n(configuration, messages);
const mockStore = configureMockStore();

describe('SingleEnrollmentCodeWarning', () => {
  it('should render with values', () => {
    const component = (
      <SingleEnrollmentCodeWarning values={{ courseAboutUrl: 'http://edx.org' }} />
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('EnrollmentCodeQuantityUpdated', () => {
  it('should render with values', () => {
    const component = (
      <IntlProvider locale="en">
        <Provider
          store={mockStore({
            payment: { currency: 'USD' },
          })}
        >
          <EnrollmentCodeQuantityUpdated values={{ quantity: 2, price: 100 }} />
        </Provider>
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
