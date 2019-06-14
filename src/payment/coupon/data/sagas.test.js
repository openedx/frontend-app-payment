import { runSaga } from 'redux-saga';

import { configureApiService } from './service';
import saga, { handleAddCoupon, handleRemoveCoupon } from './sagas';
import {
  addCoupon,
  addCouponBegin,
  addCouponSuccess,
  addCouponFailure,
  removeCouponBegin,
  removeCouponSuccess,
  removeCoupon,
  removeCouponFailure,
} from './actions';
import { PERCENTAGE_BENEFIT } from './constants';

describe('saga tests', () => {
  const configuration = {
    ECOMMERCE_BASE_URL: 'http://localhost',
  };

  describe('main saga', () => {
    it('should setup its sub sagas correctly', () => {
      const gen = saga();

      expect(gen.next()).toMatchSnapshot();
      expect(gen.next()).toMatchSnapshot();
      expect(gen.next()).toEqual({ done: true, value: undefined });
    });
  });

  describe('handleAddCoupon', () => {
    const responses = {
      successResponse: {
        data: {
          voucher: {
            id: 12345,
            code: 'DEMO25',
            benefit: {
              type: PERCENTAGE_BENEFIT,
              value: 25,
            },
          },
        },
      },
      errorResponse: {
        response: {
          data: {
            error_code: 'uhoh',
          },
        },
      },
      unexpectedErrorResponse: 'oh snap!', // We don't know how to handle this
    };

    it('should handle success', async () => {
      const apiClientPost = jest.fn(() =>
        new Promise((resolve) => {
          resolve(responses.successResponse);
        }));

      configureApiService(
        configuration,
        {
          post: apiClientPost,
        },
      );

      const dispatched = [];
      await runSaga(
        { dispatch: action => dispatched.push(action) },
        handleAddCoupon,
        addCoupon('DEMO25'),
      ).toPromise();

      expect(dispatched).toEqual([
        addCouponBegin(),
        addCouponSuccess(12345, 'DEMO25', {
          type: PERCENTAGE_BENEFIT,
          value: 25,
        }),
      ]);

      expect(apiClientPost).toHaveBeenCalledWith(
        'http://localhost/bff/payment/v0/vouchers/',
        { code: 'DEMO25' },
        { headers: { 'Content-Type': 'application/json' } },
      );
    });

    it('should handle an API error', async () => {
      const apiClientPost = jest.fn(() =>
        new Promise((resolve, reject) => {
          reject(responses.errorResponse);
        }));

      configureApiService(
        configuration,
        {
          post: apiClientPost,
        },
      );

      const dispatched = [];
      await runSaga(
        {
          dispatch: action => dispatched.push(action),
        },
        handleAddCoupon,
        addCoupon('DEMO25'),
      ).toPromise();

      expect(dispatched).toEqual([addCouponBegin(), addCouponFailure('uhoh')]);

      expect(apiClientPost).toHaveBeenCalledWith(
        'http://localhost/bff/payment/v0/vouchers/',
        { code: 'DEMO25' },
        { headers: { 'Content-Type': 'application/json' } },
      );
    });

    it('should handle an unexpected error', async () => {
      const apiClientPost = jest.fn(() =>
        new Promise((resolve, reject) => {
          reject(responses.unexpectedErrorResponse);
        }));

      configureApiService(
        configuration,
        {
          post: apiClientPost,
        },
      );

      const caughtErrors = [];
      const dispatched = [];
      try {
        await runSaga(
          {
            dispatch: action => dispatched.push(action),
            onError: error => caughtErrors.push(error),
          },
          handleAddCoupon,
          addCoupon('DEMO25'),
        ).toPromise();
      } catch (e) {
        expect(e).toEqual('oh snap!');
      }

      expect(caughtErrors).toEqual(['oh snap!']);

      expect(apiClientPost).toHaveBeenCalledWith(
        'http://localhost/bff/payment/v0/vouchers/',
        { code: 'DEMO25' },
        { headers: { 'Content-Type': 'application/json' } },
      );
    });
  });

  describe('handleRemoveCoupon', () => {
    const responses = {
      successResponse: {
        data: {
          order_total: 149,
          calculated_discount: 12,
          total_excl_discount: 161,
        },
      },
      errorResponse: {
        response: {
          data: {
            error_code: 'uhoh',
          },
        },
      },
      unexpectedErrorResponse: 'oh snap!', // We don't know how to handle this
    };

    it('should handle success', async () => {
      const apiClientDelete = jest.fn(() =>
        new Promise((resolve) => {
          resolve(responses.successResponse);
        }));

      configureApiService(
        configuration,
        {
          delete: apiClientDelete,
        },
      );

      const dispatched = [];
      await runSaga(
        { dispatch: action => dispatched.push(action) },
        handleRemoveCoupon,
        removeCoupon(12345),
      ).toPromise();

      expect(dispatched).toEqual([
        removeCouponBegin(),
        removeCouponSuccess({
          order_total: 149,
          calculated_discount: 12,
          total_excl_discount: 161,
        }),
      ]);

      expect(apiClientDelete).toHaveBeenCalledWith('http://localhost/bff/payment/v0/vouchers/12345');
    });

    it('should handle an API error', async () => {
      const apiClientDelete = jest.fn(() =>
        new Promise((resolve, reject) => {
          reject(responses.errorResponse);
        }));

      configureApiService(
        configuration,
        {
          delete: apiClientDelete,
        },
      );

      const dispatched = [];
      await runSaga(
        {
          dispatch: action => dispatched.push(action),
        },
        handleRemoveCoupon,
        removeCoupon(12345),
      ).toPromise();

      expect(dispatched).toEqual([removeCouponBegin(), removeCouponFailure('uhoh')]);

      expect(apiClientDelete).toHaveBeenCalledWith('http://localhost/bff/payment/v0/vouchers/12345');
    });

    it('should handle an unexpected error', async () => {
      const apiClientDelete = jest.fn(() =>
        new Promise((resolve, reject) => {
          reject(responses.unexpectedErrorResponse);
        }));

      configureApiService(
        configuration,
        {
          delete: apiClientDelete,
        },
      );

      const caughtErrors = [];
      const dispatched = [];
      try {
        await runSaga(
          {
            dispatch: action => dispatched.push(action),
            onError: error => caughtErrors.push(error),
          },
          handleRemoveCoupon,
          removeCoupon(12345),
        ).toPromise();
      } catch (e) {
        expect(e).toEqual('oh snap!');
      }

      expect(caughtErrors).toEqual(['oh snap!']);

      expect(apiClientDelete).toHaveBeenCalledWith('http://localhost/bff/payment/v0/vouchers/12345');
    });
  });
});
