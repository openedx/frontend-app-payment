import React from 'react';
import { render } from '../test-utils';
import {
  EmbargoErrorMessage,
  ProgramUnavailableMessage,
  IneligibleProgramErrorMessage,
  Unsuccessful3DSMessage,
} from './ErrorMessages';

function getCustomTextContent(content, node) {
  // eslint-disable-next-line no-shadow
  // The textContent property sets or returns the text content of the specified node, and all its descendants.
  const hasText = (elem) => elem.textContent === this.searchFor;
  const nodeHasText = hasText(node);
  const childrenDontHaveText = Array.from(node.children).every(
    (child) => !hasText(child),
  );

  return nodeHasText && childrenDontHaveText;
}

describe('ErrorMessages', () => {
  it('should render an EmbargoErrorMessage', () => {
    const { getByText } = render(<EmbargoErrorMessage />);
    const errorMessage = getByText("We're sorry, this program is not available in your region.");
    expect(errorMessage).toBeInTheDocument();
  });

  it('should render a ProgramUnavailableMessage', () => {
    const { getByText, getByRole } = render(<ProgramUnavailableMessage />);
    const heading = getByText(getCustomTextContent.bind({ searchFor: 'Something went wrong, please reload the page. If the issue persists please contact support.' }));
    expect(heading).toBeInTheDocument();

    const supportLink = getByRole('link', { name: /contact support/i });
    expect(supportLink).toBeInTheDocument();
    expect(supportLink.href).toBe('http://localhost:18000/support');
  });

  it('should render an IneligibleProgramErrorMessage', () => {
    const { getByText } = render(<IneligibleProgramErrorMessage />);
    const errorMessage = getByText("We're sorry, this program is no longer offering a subscription option. Please search our catalog for current availability.");
    expect(errorMessage).toBeInTheDocument();
  });

  it('should render an Unsuccessful3DSMessage', () => {
    const { getByText } = render(<Unsuccessful3DSMessage />);
    const errorMessage = getByText("We're sorry, the details you provided could not pass the 3D Secure check. Please try different payment details.");
    expect(errorMessage).toBeInTheDocument();
  });
});
