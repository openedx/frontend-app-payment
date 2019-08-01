/* eslint-disable global-require */
import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';

import UpdateQuantityForm from './UpdateQuantityForm';
import * as PaymentApiService from './data/service';

const mockStore = configureMockStore();
const store = mockStore(require('./__mocks__/defaultState.mockStore.js'));

PaymentApiService.postQuantity = jest.fn();

describe('<UpdateQuantityForm/>', () => {
  it('should render properly', () => {
    const tree = renderer
      .create((
        <Provider store={store} >
          <UpdateQuantityForm
            summaryQuantity={1}
          />
        </Provider >
      ))
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should send an update quantity request on click', () => {
    const mockApiClient = {
      post: jest.fn(),
    };

    const newQuantity = 1234;

    const wrapper = mount((
      <Provider store={store} >
        <UpdateQuantityForm
          summaryQuantity={newQuantity}
        />
      </Provider >
    ));
    wrapper.find('button').simulate('click');
    expect(PaymentApiService.postQuantity).toHaveBeenCalledWith(124555);
  });
});
