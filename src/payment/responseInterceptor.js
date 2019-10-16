import { logError } from '@edx/frontend-logging';

// For every ajax response, check if the API has
// responded with a redirect value. If so, redirect.
/* istanbul ignore next */
const responseInterceptor = (response) => {
  const { status, data } = response;
  if (status >= 200 && status < 300 && data && data.redirect) {
    // Redirecting this SPA to itself is likely to cause
    // a redirect loop.
    if (global.location.href === data.redirect) {
      logError('Potential redirect loop. The api response is redirecting to the same payment page url', {
        url: global.location.href,
      });
    }
    global.location.href = data.redirect;
  }
  return response;
};

export default responseInterceptor;
