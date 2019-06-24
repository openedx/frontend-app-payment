import React from 'react';
import { mount } from 'enzyme';

import AlertMessage from './AlertMessage';
import { DANGER } from './data/constants';

describe('AlertMessage', () => {
  // The AlertList test covers most of AlertMessage testing.

  it('should handle closing', () => {
    const closeHandlerMock = jest.fn();

    const component = (
      <AlertMessage
        id={123}
        severity={DANGER}
        message="Wondrous message!"
        closeHandler={closeHandlerMock}
      />
    );

    const wrapper = mount(component);
    wrapper.find('button.close').simulate('click');

    expect(closeHandlerMock).toHaveBeenCalledWith(123);
  });
});
