import { faCcVisa } from '@fortawesome/free-brands-svg-icons';

import { getCardIcon, getCardTypeId } from './credit-card';

describe('credit-card', () => {
  describe('getCardIcon', () => {
    it('should return null for unsupported card types', () => {
      const cardIcon = getCardIcon('606282');
      expect(cardIcon).toBeNull();
    });

    it('should return null for a nonsense card type', () => {
      const cardIcon = getCardIcon('foo');
      expect(cardIcon).toBeNull();
    });

    it('should return the expected icon for a supported card type', () => {
      expect(getCardIcon('41')).toEqual(faCcVisa);
    });
  });

  describe('getCardTypeId', () => {
    it('should return null for unsupported card types', () => {
      const cardIcon = getCardTypeId('606282');
      expect(cardIcon).toBeNull();
    });

    it('should return null for a nonsense card type', () => {
      const cardIcon = getCardTypeId('foo');
      expect(cardIcon).toBeNull();
    });

    it('should return the expected icon for a supported card type', () => {
      expect(getCardTypeId('41')).toEqual('001');
    });
  });
});
