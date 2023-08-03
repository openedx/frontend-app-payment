import { getConfig, mergeConfig } from '@edx/frontend-platform';

import {
  isWaffleFlagEnabled,
  processUrlWaffleFlags,
  WAFFLE_PREFIX,
  waffleInterceptor,
} from './waffleFlags';

/* eslint-disable import/prefer-default-export */

/**
 * Takes a potentially Asyncronous function and invokes it wraped as a promise.
 * @param {Function} fn
 * @param {Function} then
 * @returns {Promise<void>}
 */
const executePossiblyAsyncFunction = (fn, then) => Promise.resolve(fn()).then(then);

describe('Testing the Testers: executePossiblyAsyncFunction', () => {
  it('should execute as a Function', () => {
    const fn = jest.fn();
    const then = jest.fn();

    executePossiblyAsyncFunction(fn, then)
      .then(() => {
        expect(fn).toHaveBeenCalledTimes(1);
        expect(then).toHaveBeenCalledTimes(1);
      });
  });

  it('should execute as a AsyncFunction', async (done) => {
    const fnInnerMock = jest.fn();
    const then = jest.fn();
    const fn = async () => { fnInnerMock(); };

    executePossiblyAsyncFunction(fn, then)
      .then(() => {
        expect(fnInnerMock).toHaveBeenCalledTimes(1);
        expect(then).toHaveBeenCalledTimes(1);
      })
      .then(done);
  });
});

/**
 * Set our JSDOM Window and Document Location
 *
 * **NOTE**: You *MUST* include your tests async `done()` as the final action of your `perform`'s closure.
 * failure to do so will lead to test timeouts. For more information see: https://jestjs.io/docs/asynchronous#callbacks
 *
 * We accept both Function and AsyncFunction, this means we use a promise to resolve which is out of line with the
 *  invoker, thus if the invoker is itself Async, it must provide a done/resolves function to the end of its execution.
 *
 * @param {string} url The URL we intend to go to, this must be within the domain of `window.origin`
 * @param {Function} perform
 * @see window.origin
 * @see history.pushState
 * @throws {SecurityError} if not within the domain of `window.origin`
 * @return Promise<void>
 */
const performWithModifiedJSDOMLocation = (url, perform) => {
  const lastValue = window.location.href;

  /* eslint-disable-next-line no-restricted-globals */ // We need this for some test manipulation (history object)
  history.pushState(history.state, null, new URL(url));

  expect(document.location.href).toBe(url);
  expect(window.location.href).toBe(url);

  const cleanup = () => {
    /* eslint-disable-next-line no-restricted-globals */ // We need this for some test manipulation (history object)
    history.pushState(history.state, null, new URL(lastValue));
  };

  return executePossiblyAsyncFunction(perform, cleanup);
};

/**
 * Perform a test with modified waffle flags.
 *
 * This function ensures the state is returned to its default.
 *
 * **NOTE**: You *MUST* include your tests async DoneCallback as the final action of your `perform`'s closure.
 * failure to do so will lead to test timeouts.
 *
 * @param {{}} flags
 * @param {() => void} perform
 * @return Promise<void>
 */
export function performWithModifiedWaffleFlags(flags, perform) {
  const initialConfig = getConfig().WAFFLE_FLAGS;
  mergeConfig({ WAFFLE_FLAGS: flags });

  const cleanup = () => {
    mergeConfig({ WAFFLE_FLAGS: initialConfig });
  };

  return executePossiblyAsyncFunction(perform, cleanup);
}

describe('getWaffleFlags', () => {
  it('should default to document.location when empty', () => {
    // We have to use the Window's origin, otherwise: SecurityError: replaceState cannot update...
    //   Which is deep within the DOM as the window/document.location objects are monitored by
    //   other mechanisms such as history, not to mention their own counterparts.
    const testLocation = `${window.origin}/dox.asp?${WAFFLE_PREFIX}xyzzy=on`;

    return performWithModifiedJSDOMLocation(testLocation, () => {
      const result = processUrlWaffleFlags();
      expect(result).toStrictEqual({ xyzzy: true });
    });
  });

  const baseUrl = 'https://example.com/index.html?';
  test.each`
    url                                                           | result
    ${`${baseUrl + WAFFLE_PREFIX}x=on`}                           | ${{ x: true }}
    ${`${baseUrl + WAFFLE_PREFIX}x=1`}                            | ${{ x: true }}
    ${`${baseUrl + WAFFLE_PREFIX}x=t`}                            | ${{ x: true }}
    ${`${baseUrl + WAFFLE_PREFIX}x=true`}                         | ${{ x: true }}
    ${`${baseUrl + WAFFLE_PREFIX}x=true&y=off`}                   | ${{ x: true /* , y isn't a flag */ }}
    ${`${baseUrl + WAFFLE_PREFIX}x=true&${WAFFLE_PREFIX}y=off`}   | ${{ x: true, y: false }}
    ${`env://?${WAFFLE_PREFIX}x=true&${WAFFLE_PREFIX}y=off`}      | ${{ x: true, y: false }}
    ${'env://?undefined'}                                         | ${{}}
    ${'env://?'}                                                  | ${{}}
  `('can parse: $url => $result', ({ url, result }) => {
    const returnVal = processUrlWaffleFlags(url);
    expect(returnVal).toStrictEqual(result);
  });
});

describe('waffleInterceptor', () => {
  /**
   * Adds `WAFFLE_PREFIX` to all Keys and turns the values from integers in to strings
   * @param {{}} obj
   * @returns {{}}
   */
  const prefixFlags = (obj) => Object.entries(obj)
    .reduce((dict, kvpTuple) => {
      dict[WAFFLE_PREFIX + kvpTuple[0]] = kvpTuple[1].toString(); // eslint-disable-line no-param-reassign
      return dict;
    }, {});

  const makeRequestConfig = (params = {}) => ({ params: prefixFlags(params) });

  test.each`
     flags                     | result 
     ${{ x: true }}            | ${makeRequestConfig({ x: 1 })}
     ${{ x: false }}           | ${makeRequestConfig({ x: 0 })}
     ${{ x: true, y: false }}  | ${makeRequestConfig({ x: 1, y: 0 })}
   `('Config $flags => returns $result.params', async ({ flags, result }) => performWithModifiedWaffleFlags(flags, async () => {
    const interceptedParams = await waffleInterceptor(makeRequestConfig());
    expect(interceptedParams).toStrictEqual(result);
  }));
});

describe('isWaffleFlagEnabled', () => {
  test.each`
    waffles                   | results                  | reason                        | defaultValue
    ${{ x: true }}            | ${{ x: true }}           | ${'exact equality'}           | ${false}
    ${{ x: false }}           | ${{ x: false }}          | ${'exact equality'}           | ${false}
    ${{ x: true, y: false }}  | ${{ x: true, y: false }} | ${'exact equality'}           | ${false}
    ${{ x: true }}            | ${{ y: false, x: true }} | ${'missing flags are false'}  | ${false}
    ${{ x: true }}            | ${{ y: true, x: true }}  | ${'missing flags are true'}   | ${true}
  `('Testing $waffles for $reason', ({ waffles, results, defaultValue }) => performWithModifiedWaffleFlags(waffles, () => {
    Object.keys(results).forEach((key) => {
      expect(isWaffleFlagEnabled(key, defaultValue)).toEqual(results[key]);
    });
  }));
});
