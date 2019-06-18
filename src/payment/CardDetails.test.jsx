/* eslint-disable global-require */
import React from 'react';
import { shallow } from 'enzyme';
import {
  faCcAmex,
  faCcDiscover,
  faCcMastercard,
  faCcVisa,
} from '@fortawesome/free-brands-svg-icons';

import { CardDetailsComponent } from './CardDetails';

describe('<CardDetails />', () => {
  describe('updateCardType', () => {
    it('updates state with correct card icon given user card number input', () => {
      const cardDetails = shallow(<CardDetailsComponent />).instance();
      const eventMock = jest.fn();
      const testData = [
        { cardNumber: '347', expectedIcon: faCcAmex },
        { cardNumber: '6011', expectedIcon: faCcDiscover },
        { cardNumber: '511', expectedIcon: faCcMastercard },
        { cardNumber: '411', expectedIcon: faCcVisa },
        { cardNumber: '111', expectedIcon: null },
      ];

      testData.forEach(({ cardNumber, expectedIcon }) => {
        cardDetails.updateCardType(eventMock, cardNumber);
        expect(cardDetails.state.cardIcon).toBe(expectedIcon);
      });
    });
  });
});
