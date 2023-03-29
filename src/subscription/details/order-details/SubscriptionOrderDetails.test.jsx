import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { SubscriptionOrderDetails } from './SubscriptionOrderDetails';

describe('SubscriptionOrderDetails', () => {
  it('should render skeleton when programTitle is empty string', () => {
    const tree = renderer.create(
      <IntlProvider locale="en">
        <SubscriptionOrderDetails programTitle="" />
      </IntlProvider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render order details for Dummy Program', () => {
    const tree = renderer.create(
      <IntlProvider locale="en">
        <SubscriptionOrderDetails programTitle="Dummy Program" />
      </IntlProvider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
