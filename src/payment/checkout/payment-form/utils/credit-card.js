import {
  faCcAmex,
  faCcDiscover,
  faCcMastercard,
  faCcVisa,
} from '@fortawesome/free-brands-svg-icons';

const CardValidator = require('../../card-validator');

export const CARD_TYPES = {
  'american-express': '003',
  discover: '004',
  mastercard: '002',
  visa: '001',
};

export const CARD_ICONS = {
  '003': faCcAmex,
  '004': faCcDiscover,
  '002': faCcMastercard,
  '001': faCcVisa,
};

export function getCardIconForType(cardType) {
  let cardIcon = null;
  if (CARD_ICONS[cardType] !== undefined) {
    cardIcon = CARD_ICONS[cardType];
  }
  return cardIcon;
}

export function getCardTypeId(cardNumber) {
  const { card } = CardValidator.number(cardNumber);
  if (card && CARD_TYPES[card.type] !== undefined) {
    return CARD_TYPES[card.type];
  }
  return null;
}

export function getCardIcon(cardNumber) {
  const cardType = getCardTypeId(cardNumber);
  if (cardType === null) {
    return null;
  }
  return getCardIconForType(cardType);
}
