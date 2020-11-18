/* eslint-disable global-require */
import React from 'react';
import { shallow } from 'enzyme';

import { CardDetailsComponent } from './CardDetails';

const mockIntl = {
  formatMessage: () => 'I18N_TEXT',
};

describe('<CardDetails />', () => { // FIXME: TEST: PCI: does this need some real tests?
  it('exists', () => {
    const cardDetails = shallow(<CardDetailsComponent intl={mockIntl} />).instance();
    expect(cardDetails).toBeTruthy();
  });
});
