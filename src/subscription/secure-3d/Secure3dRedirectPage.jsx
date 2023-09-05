import React, { useEffect } from 'react';

/**
 * Secure3dRedirectPage
 * On the completion of 3DS authentication from the bank site,
 * user will be redirected to this page. Loading this
 * page will update its parent window that 3DS
 * flow has been completed and iframe, modal
 * should be close now.
 */
export const Secure3dRedirectPage = () => {
  useEffect(() => {
    window.top.postMessage('3DS-authentication-complete', '*');
  }, []);
  return (
    <div className="secure-page-container">
      <div className="spinner-border" data-testid="3ds-spinner" />
    </div>
  );
};

export default Secure3dRedirectPage;
