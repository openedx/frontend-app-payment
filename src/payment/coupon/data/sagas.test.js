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
import { fetchBasketSuccess } from '../../data/actions';
import { transformResults } from '../../data/service';
import { addMessage, INFO, DANGER } from '../../../feedback';

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
          show_coupon_form: true,
          coupons: [
            {
              id: 12345,
              code: 'DEMO25',
              benefit_value: '25%',
            },
          ],
          summary_price: 161,
          order_total: 149,
          summary_discounts: 12,
          products: [
            {
              image_url: 'https://prod-discovery.edx-cdn.org/media/course/image/21be6203-b140-422c-9233-a1dc278d7266-941abf27df4d.small.jpg',
              title: 'Introduction to Happiness',
              certificate_type: 'verified',
              product_type: 'Seat',
              sku: '8CF08E5',
            },
          ],
        },
      },
      blankVoucherResponse: {
        data: {
          coupons: [],
          show_coupon_form: true,
          summary_price: 161,
          order_total: 161,
          summary_discounts: 0,
          products: [
            {
              image_url: 'https://prod-discovery.edx-cdn.org/media/course/image/21be6203-b140-422c-9233-a1dc278d7266-941abf27df4d.small.jpg',
              title: 'Introduction to Happiness',
              certificate_type: 'verified',
              product_type: 'Seat',
              sku: '8CF08E5',
            },
          ],
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

      configureApiService(configuration, {
        post: apiClientPost,
      });

      const dispatched = [];
      await runSaga(
        {
          dispatch: action => dispatched.push(action),
        },
        handleAddCoupon,
        addCoupon('DEMO25'),
      ).toPromise();

      expect(dispatched).toEqual([
        addCouponBegin(),
        fetchBasketSuccess(transformResults(responses.successResponse.data)),
        addCouponSuccess(12345, 'DEMO25', '25%'),
        addMessage(
          'payment.coupon.added',
          null,
          {
            code: 'DEMO25',
          },
          INFO,
        ),
      ]);
      expect(apiClientPost).toHaveBeenCalledWith(
        'http://localhost/bff/payment/v0/vouchers/',
        { code: 'DEMO25' },
        { headers: { 'Content-Type': 'application/json' } },
      );
    });

    it('should handle an empty coupons', async () => {
      const apiClientPost = jest.fn(() =>
        new Promise((resolve) => {
          resolve(responses.blankVoucherResponse);
        }));

      configureApiService(configuration, {
        post: apiClientPost,
      });

      const dispatched = [];
      await runSaga(
        {
          dispatch: action => dispatched.push(action),
        },
        handleAddCoupon,
        addCoupon('DEMO25'),
      ).toPromise();

      expect(dispatched).toEqual([
        addCouponBegin(),
        fetchBasketSuccess(transformResults(responses.blankVoucherResponse.data)),
        addCouponSuccess(null, null, null),
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

      configureApiService(configuration, {
        post: apiClientPost,
      });

      const dispatched = [];
      await runSaga(
        {
          dispatch: action => dispatched.push(action),
        },
        handleAddCoupon,
        addCoupon('DEMO25'),
      ).toPromise();

      expect(dispatched).toEqual([
        addCouponBegin(),
        addCouponFailure(),
        addMessage(
          'uhoh',
          null,
          null,
          DANGER,
        ),
      ]);

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

      configureApiService(configuration, {
        post: apiClientPost,
      });

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
          show_coupon_form: true,
          coupons: [
            {
              id: 12345,
              code: 'DEMO25',
              benefit_value: '25%',
            },
          ],
          summary_price: 161,
          order_total: 149,
          summary_discounts: 12,
          products: [
            {
              image_url: 'https://prod-discovery.edx-cdn.org/media/course/image/21be6203-b140-422c-9233-a1dc278d7266-941abf27df4d.small.jpg',
              title: 'Introduction to Happiness',
              certificate_type: 'verified',
              product_type: 'Seat',
              sku: '8CF08E5',
            },
          ],
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

      configureApiService(configuration, {
        delete: apiClientDelete,
      });

      const dispatched = [];
      await runSaga(
        {
          dispatch: action => dispatched.push(action),
          getState: () => ({
            payment: { coupon: { code: 'DEMO25' } },
          }),
        },
        handleRemoveCoupon,
        removeCoupon(12345),
      ).toPromise();

      expect(dispatched).toEqual([
        removeCouponBegin(),
        fetchBasketSuccess(transformResults(responses.successResponse.data)),
        removeCouponSuccess(transformResults(responses.successResponse.data)),
        addMessage(
          'payment.coupon.removed',
          null,
          {
            code: 'DEMO25',
          },
          INFO,
        ),
      ]);

      expect(apiClientDelete).toHaveBeenCalledWith('http://localhost/bff/payment/v0/vouchers/12345');
    });

    it('should handle an API error', async () => {
      const apiClientDelete = jest.fn(() =>
        new Promise((resolve, reject) => {
          reject(responses.errorResponse);
        }));

      configureApiService(configuration, {
        delete: apiClientDelete,
      });

      const dispatched = [];
      await runSaga(
        {
          dispatch: action => dispatched.push(action),
          getState: () => ({
            payment: { coupon: { code: 'DEMO25' } },
          }),
        },
        handleRemoveCoupon,
        removeCoupon(12345),
      ).toPromise();

      expect(dispatched).toEqual([
        removeCouponBegin(),
        removeCouponFailure(),
        addMessage(
          'uhoh',
          null,
          null,
          DANGER,
        ),
      ]);

      expect(apiClientDelete).toHaveBeenCalledWith('http://localhost/bff/payment/v0/vouchers/12345');
    });

    it('should handle an unexpected error', async () => {
      const apiClientDelete = jest.fn(() =>
        new Promise((resolve, reject) => {
          reject(responses.unexpectedErrorResponse);
        }));

      configureApiService(configuration, {
        delete: apiClientDelete,
      });

      const caughtErrors = [];
      const dispatched = [];
      try {
        await runSaga(
          {
            dispatch: action => dispatched.push(action),
            onError: error => caughtErrors.push(error),
            getState: () => ({
              payment: { coupon: { code: 'DEMO25' } },
            }),
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
