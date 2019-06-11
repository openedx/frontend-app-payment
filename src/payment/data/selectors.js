export const storeName = 'payment';
export const paymentSelector = (state) => {
  const paymentState = state[storeName];
  const loaded = !paymentState.loading && !paymentState.loadingError;

  return {
    ...paymentState,
    loaded,
    isEmpty: loaded && paymentState.products && paymentState.products.length > 0,
  };
};

export const basketSelector = state => ({ ...state[storeName] });
