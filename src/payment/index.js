import { getConfig } from '@edx/frontend-platform';


// HACK: short-lived function to send some testing events; sticking it here since there doesn't
// seem to be a general 'utils' file.
// HACK: deliberately not doing this through the regular sendTrackEvent system to more closely
// match how these will be sent in the static page test.
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-template */
/* eslint-disable dot-notation */
export function sendRev1074Event(eventType, eventData) {
  eventData['_export'] = 'false'; // Don't let these events be exported to partners

  let perfTiming;
  try {
    perfTiming = window.performance.timing.toJSON();
  } catch (e) {
    perfTiming = { error: e.toString() };
  }
  eventData.timing = perfTiming;

  const encodedEvent = [
    'event_type=edx.experiment.rev1074.' + eventType,
    'page=' + window.location.href,
    'event=' + encodeURIComponent(JSON.stringify(eventData)),
  ].join('&').replace(/%20/g, '+');

  const eventUrl = getConfig().LMS_BASE_URL + '/event';
  const xhr = new XMLHttpRequest();
  xhr.open('GET', eventUrl + '?' + encodedEvent);
  xhr.send();
}
/* eslint-enable no-param-reassign */
/* eslint-enable prefer-template */
/* eslint-enable dot-notation */

export { default as PaymentPage } from './PaymentPage';
export { default as reducer } from './data/reducers';
export { default as saga } from './data/sagas';
export { storeName } from './data/selectors';
export { default as EcommerceRedirect } from './EcommerceRedirect';
export { default as responseInterceptor } from './responseInterceptor';
export { markPerformanceIfAble, getPerformanceProperties } from './performanceEventing';
