export const storeName = 'receipt';

export const receiptSelector = () => ({
  isLoading: false,
  hasEnrollmentCodeProduct: false,
  products: [{
    quantity: 1,
    description: 'Seat in Animation and CGI Motion with verified certificate (and ID verification)',
    organization: 'edX',
    itemPrice: '$100',
  }],
  totals: {
    subtotal: '$100',
    total: '$100',
  },
  order: {
    number: 'EDX-188304',
    payment: 'Visa xxxxxxxxxxxx1111',
    date: 'October 02, 2019',
    address: [
      'Full Name',
      '123 Main St',
      'Cambridge',
      'MA',
      '02169',
      'United States',
    ],
  },
});
