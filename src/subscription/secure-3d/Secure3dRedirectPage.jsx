import React from 'react';

/**
 * Secure3dRedirectPage
 * On the completion of 3DS step bank site will
 * redirect user to this page. On loading this
 * page will update its parent window that 3DS
 * flow has been completed and iframe, modal
 * should be close now.
 */
export const Secure3dRedirectPage = () => {
  window.top.postMessage('3DS-authentication-complete');
  return (
    <div className="secure-page-container">
      <div className="spinner-border" />
    </div>
  );
};

export default Secure3dRedirectPage;
