import { getConfig } from '@edx/frontend-platform';
import { logInfo } from '@edx/frontend-platform/logging';

/**
 * This component's job is to redirect to the ecommerce service and log the path
 * we were trying to hit.  There are times we get redirected to ecommerce paths on the same domain,
 * and this component ensures that those requests get fulfilled by ecommerce instead of being
 * handled by this micro-frontend (which doesn't know how to handle them).
 *
 * It doesn't actually render anything.
 */
export default function EcommerceRedirect() {
  logInfo(`Redirecting to ecommerce for path: ${global.location.pathname}`);
  // We want to redirect to ecommerce for all pages we don't know how to handle here.
  // This is intended as a stopgap until more permanent server-side logic can be put
  // in place.
  // More info here on why: https://openedx.atlassian.net/browse/ARCH-1074
  global.location.href = `${getConfig().ECOMMERCE_BASE_URL}${global.location.pathname}${global.location.search}${global.location.hash}`;
  return null;
}
