import React from 'react';
import {
  render,
} from '../test-utils';
import { Secure3dRedirectPage } from './Secure3dRedirectPage';

describe('Secure3dRedirectPage', () => {
  it('should post a message on mount', () => {
    // Mock postMessage function
    const originalPostMessage = window.top.postMessage;
    window.top.postMessage = jest.fn();

    // Render the component
    render(<Secure3dRedirectPage />);

    // Assert postMessage has been called with the expected arguments
    expect(window.top.postMessage).toHaveBeenCalledTimes(1);
    expect(window.top.postMessage).toHaveBeenCalledWith('3DS-authentication-complete', '*');

    // Restore the original postMessage function
    window.top.postMessage = originalPostMessage;
  });

  it('should render a spinner', () => {
    const { getByTestId } = render(<Secure3dRedirectPage />);
    const spinner = getByTestId('3ds-spinner');
    expect(spinner).toBeInTheDocument();
  });
});
