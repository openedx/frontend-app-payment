import { Factory } from 'rosie';
import '../__factories__/basket.factory';

import { defaultRoutineStages } from 'redux-saga-routines';
import { ORDER_TYPES, WAFFLE_FLAGS } from './constants';
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
  getPropsToRemoveFractionZeroDigits,
  SECS_AS_MS,
  MINS_AS_MS,
  chainReducers,
  createCustomRoutine,
  isCommerceCoordinatorEnabled,
} from './utils';
import { performWithModifiedWaffleFlags } from '../../data/waffleFlags.test';

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

describe('getPropsToRemoveFractionZeroDigits', () => {
  it('should only hide fractional zeros when shouldRemoveFractionZeroDigits is false', () => {
    expect(getPropsToRemoveFractionZeroDigits({ price: 79.00, shouldRemoveFractionZeroDigits: true })).toEqual({
      maximumFractionDigits: 0,
    });
    expect(getPropsToRemoveFractionZeroDigits({ price: 79.00, shouldRemoveFractionZeroDigits: false })).toEqual({ });

    expect(getPropsToRemoveFractionZeroDigits({ price: 79.43, shouldRemoveFractionZeroDigits: true })).toEqual({ });
    expect(getPropsToRemoveFractionZeroDigits({ price: 79.43, shouldRemoveFractionZeroDigits: false })).toEqual({ });
  });
});

describe('Time Functions', () => {
  const tests = [
    /* eslint-disable no-multi-spaces */ // Formatted for tabular layout
    // Functional Tests
    { fn: SECS_AS_MS, in: 10, out: 10000 },
    { fn: SECS_AS_MS, in: 1,  out: 1000 },
    { fn: SECS_AS_MS, in: 0,  out: 0 },
    { fn: MINS_AS_MS, in: 10, out: 600000 },
    { fn: MINS_AS_MS, in: 1,  out: 60000 },
    { fn: MINS_AS_MS, in: 0,  out: 0 },

    // Comparative Result Tests (Since these are pure & mathematical, they should never fail to run, but be wrong.)
    { name: 'SECS eq MIN Conversions Match', in: MINS_AS_MS(0),   out: SECS_AS_MS(0) },
    { name: 'SECS eq MIN Conversions Match', in: MINS_AS_MS(2),   out: SECS_AS_MS(120) },
    { name: 'SECS eq MIN Conversions Match', in: MINS_AS_MS(500), out: SECS_AS_MS(30000) },
    // intentionally absurd value
    { name: 'SECS eq MIN Conversions Match', in: MINS_AS_MS(7217), out: SECS_AS_MS(433020) },
    /* eslint-enable no-multi-spaces */
  ];

  for (let i = 0, testPlan = tests[i]; i < tests.length; i++, testPlan = tests[i]) {
    const functionalTest = testPlan.fn !== undefined;
    const testBaseName = functionalTest ? testPlan.fn.name : testPlan.name;

    it(`${testBaseName} In: ${testPlan.in} Out: ${testPlan.out}`, () => {
      if (functionalTest) {
        expect(testPlan.fn(testPlan.in)).toEqual(testPlan.out);
      } else {
        expect(testPlan.in).toEqual(testPlan.out);
      }
    });
  }
});

describe('chainReducers([reducers])', () => {
  /* Test Constants */
  const DEFAULT_VALUE = 'x';
  const SET_VALUE = 'set';

  /* Functors/Data Generators */
  const addAction = (reducer, testAction) => (state, action) => (
    reducer
      ? reducer.call(null, state, action || testAction) : undefined
  );
  const alphaReducer = (val) => (stateX) => ({ ...stateX, myval: val });
  const testAction = (x = 'test_action') => ({ type: x });

  /* Canned Tests */
  const tests = [
    {
      first: alphaReducer('a'),
      second: alphaReducer('b'),
      action: testAction(),
      value: 'b',
      msg: 'Should succeed.',
    },
    {
      first: alphaReducer('b'),
      second: alphaReducer('a'),
      action: testAction(),
      value: 'a',
      msg: 'Should succeed. (tests ordering by running the last test in reverse and expecting the opposite value)',
    },
    {
      first: alphaReducer('c'),
      second: undefined,
      action: testAction(),
      value: 'c',
      msg: 'Should succeed. (returning the original reducer)',
    },
    {
      first: undefined,
      second: undefined,
      action: testAction(),
      value: undefined,
      msg: 'Should succeed. (undefined use is considered... undefined... react will likely explode.)',
    },
  ].map((x) => ([`chain reducers return ${x.value}, ${x.msg}`, x]));

  test.each(tests)('%s', (label, testPlan) => {
    const reducers = [testPlan.first, testPlan.second]
      .reduce((arry, reducer) => {
        if (reducer) {
          arry.push(reducer); // eslint-disable-line no-param-reassign
        }
        return arry;
      }, []);

    const resultingState = addAction(chainReducers(reducers), testPlan.action);

    if (testPlan.value === undefined) {
      expect(resultingState({ myval: DEFAULT_VALUE }, null)).toEqual(testPlan.value);
    } else {
      expect(resultingState({ myval: DEFAULT_VALUE }, null).myval).toEqual(testPlan.value);
    }
  });

  /* More Complex Stuff */
  it('chain reducers should accumulate each others state', () => {
    const reducer1 = (state) => ({ ...state, first_reducer_value: SET_VALUE });
    const reducer2 = (state) => ({ ...state, second_reducer_value: SET_VALUE });

    const action = testAction();

    const resultingState = addAction(chainReducers([reducer1, reducer2]), action);
    const resultingStateFlipped = addAction(chainReducers([reducer2, reducer1]), action);

    const firstStateResult = resultingState({ myval: DEFAULT_VALUE }, null);
    const secondStateResult = resultingStateFlipped({ myval: DEFAULT_VALUE }, null);

    expect(firstStateResult.myval).toEqual(DEFAULT_VALUE);
    expect(firstStateResult.first_reducer_value).toEqual(SET_VALUE);
    expect(firstStateResult.second_reducer_value).toEqual(SET_VALUE);

    expect(secondStateResult.myval).toEqual(DEFAULT_VALUE);
    expect(secondStateResult.first_reducer_value).toEqual(SET_VALUE);
    expect(secondStateResult.second_reducer_value).toEqual(SET_VALUE);
  });

  it('chain reducers should fall through if actions arent responded to', () => {
    const reducer1 = function _reducer1(state, action) {
      if (action.type !== 'reducer1') { return ({ ...state }); }
      return ({ ...state, first_reducer_value: SET_VALUE });
    };
    const reducer2 = function _reducer2(state, action) {
      if (action.type !== 'reducer2') { return ({ ...state }); }
      return ({ ...state, first_reducer_value: SET_VALUE });
    };

    const action = testAction('reducer1');

    const resultingState = addAction(chainReducers([reducer1, reducer2]), action);

    const firstStateResult = resultingState({ myval: DEFAULT_VALUE }, null);

    expect(firstStateResult.myval).toEqual(DEFAULT_VALUE);
    expect(firstStateResult.first_reducer_value).toEqual(SET_VALUE);
    expect(firstStateResult.second_reducer_value).toEqual(undefined);
  });
});

describe('createCustomRoutine', () => {
  const tests = [
    {
      name: 'Additional Stage (UC) + Inherts Default Stages',
      params: { name: 'TEST_ROUTINE_1', addtlStages: ['MEOW'], inheritDefaults: true },
    },
    {
      name: 'Additional Stage (LC) + Inherts Default Stages',
      params: { name: 'TEST_ROUTINE_2', addtlStages: ['meow'], inheritDefaults: true },
    },
    {
      name: 'Additional Stage (LC) + Doesnt Inherit Default Stages',
      params: { name: 'TEST_ROUTINE_3', addtlStages: ['woof'], inheritDefaults: false },
    },
  ];

  for (let i = 0, testPlan = tests[i]; i < tests.length; i++, testPlan = tests[i]) {
    it(testPlan.name, () => {
      /* eslint-disable no-underscore-dangle */ // We don't control the fact that we have to access _ props here.
      const routineUnderTest = createCustomRoutine(
        testPlan.params.name,
        testPlan.params.addtlStages,
        testPlan.params.inheritDefaults,
      );

      expect(routineUnderTest._PREFIX).toEqual(testPlan.params.name);

      for (let si = 0, stageName = defaultRoutineStages[si];
        si < defaultRoutineStages.length;
        si++, stageName = defaultRoutineStages[si]) {
        if (testPlan.params.inheritDefaults) {
          expect(routineUnderTest._STAGES).toContain(stageName);
        } else {
          expect(routineUnderTest._STAGES).not.toContain(stageName);
        }
      }

      for (let si = 0, stageName = testPlan.params.addtlStages[si];
        si < testPlan.params.addtlStages.length;
        si++, stageName = testPlan.params.addtlStages[si]) {
        expect(routineUnderTest._STAGES).toContain(stageName.toUpperCase());
      }
      /* eslint-enable no-underscore-dangle */
    });
  }
});

describe('isCommerceCoordinatorEnabled', () => {
  /** Expected CC Waffle Flag */
  const CC_FLAG = WAFFLE_FLAGS.COMMERCE_COORDINATOR_ENABLED;
  /** Trash flag, CC should come back false */
  const XX_FLAG = 'transition_to_coordinator.XXX';

  test.each`
    flags                    | expected
    ${{ [CC_FLAG]: true }}   | ${true}
    ${{ [CC_FLAG]: false }}  | ${false}
    ${{ [XX_FLAG]: true }}   | ${false}
  `('Flags $flags should yield $expected', ({ flags, expected }) => {
    performWithModifiedWaffleFlags(flags, () => {
      expect(isCommerceCoordinatorEnabled()).toStrictEqual(expected);
    });
  });
});
