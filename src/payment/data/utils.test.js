import { Factory } from 'rosie';
import '../__factories__/basket.factory';

import { ORDER_TYPES } from './constants';
import {
  AsyncActionType,
  modifyObjectKeys,
  camelCaseObject,
  snakeCaseObject,
  convertKeyNames,
  keepKeys,
  getModuleState,
  generateAndSubmitForm,
  getOrderType,
  transformResults,
} from './utils';

describe('modifyObjectKeys', () => {
  it('should use the provided modify function to change all keys in and object and its children', () => {
    function meowKeys(key) {
      return `${key}Meow`;
    }

    const result = modifyObjectKeys(
      {
        one: undefined,
        two: null,
        three: '',
        four: 0,
        five: NaN,
        six: [1, 2, { seven: 'woof' }],
        eight: { nine: { ten: 'bark' }, eleven: true },
      },
      meowKeys,
    );

    expect(result).toEqual({
      oneMeow: undefined,
      twoMeow: null,
      threeMeow: '',
      fourMeow: 0,
      fiveMeow: NaN,
      sixMeow: [1, 2, { sevenMeow: 'woof' }],
      eightMeow: { nineMeow: { tenMeow: 'bark' }, elevenMeow: true },
    });
  });
});

describe('camelCaseObject', () => {
  it('should make everything camelCase', () => {
    const result = camelCaseObject({
      what_now: 'brown cow',
      but_who: { says_you_people: 'okay then', but_how: { will_we_even_know: 'the song is over' } },
      'dot.dot.dot': 123,
    });

    expect(result).toEqual({
      whatNow: 'brown cow',
      butWho: { saysYouPeople: 'okay then', butHow: { willWeEvenKnow: 'the song is over' } },
      dotDotDot: 123,
    });
  });
});

describe('snakeCaseObject', () => {
  it('should make everything snake_case', () => {
    const result = snakeCaseObject({
      whatNow: 'brown cow',
      butWho: { saysYouPeople: 'okay then', butHow: { willWeEvenKnow: 'the song is over' } },
      'dot.dot.dot': 123,
    });

    expect(result).toEqual({
      what_now: 'brown cow',
      but_who: { says_you_people: 'okay then', but_how: { will_we_even_know: 'the song is over' } },
      dot_dot_dot: 123,
    });
  });
});

describe('convertKeyNames', () => {
  it('should replace the specified keynames', () => {
    const result = convertKeyNames(
      {
        one: { two: { three: 'four' } },
        five: 'six',
      },
      {
        two: 'blue',
        five: 'alive',
        seven: 'heaven',
      },
    );

    expect(result).toEqual({
      one: { blue: { three: 'four' } },
      alive: 'six',
    });
  });
});

describe('keepKeys', () => {
  it('should keep the specified keys only', () => {
    const result = keepKeys(
      {
        one: 123,
        two: { three: 'skip me' },
        four: 'five',
        six: null,
        8: 'sneaky',
      },
      [
        'one',
        'three',
        'six',
        'seven',
        '8', // yup, the 8 integer will be converted to a string.
      ],
    );

    expect(result).toEqual({
      one: 123,
      six: null,
      8: 'sneaky',
    });
  });

  describe('AsyncActionType', () => {
    it('should return well formatted action strings', () => {
      const actionType = new AsyncActionType('HOUSE_CATS', 'START_THE_RACE');

      expect(actionType.BASE).toBe('HOUSE_CATS__START_THE_RACE');
      expect(actionType.BEGIN).toBe('HOUSE_CATS__START_THE_RACE__BEGIN');
      expect(actionType.SUCCESS).toBe('HOUSE_CATS__START_THE_RACE__SUCCESS');
      expect(actionType.FAILURE).toBe('HOUSE_CATS__START_THE_RACE__FAILURE');
      expect(actionType.RESET).toBe('HOUSE_CATS__START_THE_RACE__RESET');
    });
  });

  describe('getModuleState', () => {
    const state = {
      first: { red: { awesome: 'sauce' }, blue: { weak: 'sauce' } },
      second: { other: 'data' },
    };

    it('should return everything if given an empty path', () => {
      expect(getModuleState(state, [])).toEqual(state);
    });

    it('should resolve paths correctly', () => {
      expect(getModuleState(state, ['first'])).toEqual({
        red: { awesome: 'sauce' },
        blue: { weak: 'sauce' },
      });

      expect(getModuleState(state, ['first', 'red'])).toEqual({ awesome: 'sauce' });

      expect(getModuleState(state, ['second'])).toEqual({ other: 'data' });
    });

    it('should throw an exception on a bad path', () => {
      expect(() => {
        getModuleState(state, ['uhoh']);
      }).toThrowErrorMatchingSnapshot();
    });

    it('should return non-objects correctly', () => {
      expect(getModuleState(state, ['first', 'red', 'awesome'])).toEqual('sauce');
    });
  });
});

describe('generateAndSubmitForm', () => {
  let createElementSpy = null;
  let submitMock = null;

  beforeEach(() => {
    submitMock = jest.fn();
    createElementSpy = jest.spyOn(global.document, 'createElement').mockImplementation(() => ({
      appendChild: jest.fn(),
      submit: submitMock,
    }));
    jest.spyOn(global.document.body, 'appendChild').mockImplementation(() => {});
  });

  afterEach(() => {
    createElementSpy.mockReset();
  });

  it('should generate a form without any params provided', () => {
    generateAndSubmitForm('http://localhost');

    expect(createElementSpy).toHaveBeenCalledWith('form');
    expect(createElementSpy).toHaveBeenCalledTimes(1);
    expect(submitMock).toHaveBeenCalledTimes(1);
  });

  it('should generate a form with an empty params object', () => {
    generateAndSubmitForm('http://localhost', {});

    expect(createElementSpy).toHaveBeenCalledWith('form');
    expect(createElementSpy).toHaveBeenCalledTimes(1);
    expect(submitMock).toHaveBeenCalledTimes(1);
  });

  it('should generate a hidden field for each param', () => {
    generateAndSubmitForm('http://localhost', {
      foo: 'bar',
      baz: 'buh',
    });

    expect(createElementSpy).toHaveBeenNthCalledWith(1, 'form');
    expect(createElementSpy).toHaveBeenNthCalledWith(2, 'input');
    expect(createElementSpy).toHaveBeenNthCalledWith(3, 'input');
    expect(createElementSpy).toHaveBeenCalledTimes(3);
    expect(submitMock).toHaveBeenCalledTimes(1);
  });
});

describe('getOrderType', () => {
  it('should return valid ORDER_TYPE for given productType', () => {
    expect(getOrderType()).toBe(ORDER_TYPES.SEAT);
    expect(getOrderType('Seat')).toBe(ORDER_TYPES.SEAT);
    expect(getOrderType('Enrollment Code')).toBe(ORDER_TYPES.BULK_ENROLLMENT);
    expect(getOrderType('Course Entitlement')).toBe(ORDER_TYPES.ENTITLEMENT);
  });
});

describe('transformResults', () => {
  it('should transform snake_case basket data to camelCase', () => {
    const entitlementBasketData = Factory.build('basket', {}, { numProducts: 2, productType: 'Course Entitlement' });
    expect(transformResults(entitlementBasketData)).toEqual({
      ...camelCaseObject(entitlementBasketData),
      orderType: ORDER_TYPES.ENTITLEMENT,
    });
    const seatBasketData = Factory.build('basket', {}, { numProducts: 3, productType: 'Seat' });
    expect(transformResults(seatBasketData)).toEqual({
      ...camelCaseObject(seatBasketData),
      orderType: ORDER_TYPES.SEAT,
    });
  });
});
