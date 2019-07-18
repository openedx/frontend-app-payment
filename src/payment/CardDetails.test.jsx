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
  describe('handleCardNumberChange', () => {
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
        cardDetails.handleCardNumberChange(eventMock, cardNumber);
        expect(cardDetails.state.cardIcon).toBe(expectedIcon);
      });
    });
  });

  describe('handleSecurityCodeChange', () => {
    const cardDetails = shallow(<CardDetailsComponent />).instance();

    it('updates the securityCode state when changing the securityCode input', () => {
      cardDetails.handleSecurityCodeChange(null, '123');
      expect(cardDetails.state.securityCode).toBe('123');
    });
  });

  describe('updateCardExpiryDate', () => {
    const cardDetails = shallow(<CardDetailsComponent />).instance();

    it('updates the date when changing the year', () => {
      cardDetails.updateCardExpiryYear(null, '2020');
      expect(cardDetails.state.cardExpiryDate).toBe('-2020');
    });

    it('updates the date when changing the month', () => {
      cardDetails.updateCardExpiryMonth(null, '5');
      expect(cardDetails.state.cardExpiryDate).toBe('05-2020');
    });
  });
});
