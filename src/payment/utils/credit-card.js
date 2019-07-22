import {
  faCcAmex,
  faCcDiscover,
  faCcMastercard,
  faCcVisa,
} from '@fortawesome/free-brands-svg-icons';

const CardValidator = require('card-validator');

export const SUPPORTED_CARDS = {
  'american-express': { cardTypeId: '003', cardIcon: faCcAmex },
  discover: { cardTypeId: '004', cardIcon: faCcDiscover },
  mastercard: { cardTypeId: '002', cardIcon: faCcMastercard },
  visa: { cardTypeId: '001', cardIcon: faCcVisa },
};

export function getCardIcon(cardNumber) {
  let cardIcon = null;
  const { card } = CardValidator.number(cardNumber);
  if (card) {
    ({ cardIcon } = SUPPORTED_CARDS[card.type]);
  }
  return cardIcon;
}

export function getCardTypeId(cardNumber) {
  let cardTypeId = null;
  const { card } = CardValidator.number(cardNumber);
  if (card) {
    ({ cardTypeId } = SUPPORTED_CARDS[card.type]);
  }
  return cardTypeId;
}
