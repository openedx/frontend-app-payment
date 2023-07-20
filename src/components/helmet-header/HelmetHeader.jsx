import React from 'react';
import { Helmet } from 'react-helmet';

/**
 * HelmetHeader
 * using this header to apply stripe redirect url
 * content security policy as mentioned here for 3DS
 * https://stripe.com/docs/security/guide#content-security-policy
 */
export const HelmetHeader = () => (
  <Helmet>
    <meta
      httpEquiv="Content-Security-Policy"
      content="
        frame-src 'self' https://js.stripe.com https://hooks.stripe.com
      "
    />
  </Helmet>
);

export default HelmetHeader;
