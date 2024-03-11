import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';

import ProductLineItem from './ProductLineItem';

const product = {
  imageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/21be6203-b140-422c-9233-a1dc278d7266-941abf27df4d.small.jpg',
  title: 'Introduction to Happiness',
  certificateType: 'verified',
  productType: 'Seat',
  sku: '8CF08E5',
};

describe('<ProductLineItem />', () => {
  describe('Rendering', () => {
    it('should render the product details', () => {
      const { container: tree } = render(
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for professional certificate', () => {
      product.certificateType = 'professional';
      const { container: tree } = render(
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for no-id-professional certificate', () => {
      product.certificateType = 'no-id-professional';
      const { container: tree } = render(
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for verified certificate', () => {
      product.certificateType = 'verified';
      const { container: tree } = render(
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for unknown seat type', () => {
      product.certificateType = null;
      const { container: tree } = render(
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for honor certificate', () => {
      product.certificateType = 'honor';
      const { container: tree } = render(
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>,
      );
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for audit certificate', () => {
      product.certificateType = 'audit';
      const { container: tree } = render(
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
});
