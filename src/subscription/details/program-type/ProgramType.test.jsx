import React from 'react';
import { ProgramType } from './ProgramType';
import { render, screen } from '../../test-utils';

describe('ProgramType', () => {
  it('should render the correct program type', () => {
    const { rerender } = render(<ProgramType type="XSeries" />);
    expect(screen.getByRole('heading')).toHaveTextContent('XSeries');

    rerender(<ProgramType type="Professional Certificate" />);
    expect(screen.getByRole('heading')).toHaveTextContent('Professional Certificate');

    rerender(<ProgramType type="MicroBachelors" />);
    expect(screen.getByText(/MicroBachelors/i)).toBeInTheDocument();
  });
});
