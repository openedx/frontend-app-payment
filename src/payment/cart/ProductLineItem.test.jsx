import React from 'react';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-i18n';
import renderer from 'react-test-renderer';
import ProductLineItem from './ProductLineItem';
import { configuration } from '../../environment';
import messages from '../../i18n';

configureI18n(configuration, messages);

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
      const tree = renderer.create((
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>
      )).toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for professional certificate', () => {
      product.certificateType = 'professional';
      const tree = renderer.create((
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>
      )).toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for no-id-professional certificate', () => {
      product.certificateType = 'no-id-professional';
      const tree = renderer.create((
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>
      )).toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for verified certificate', () => {
      product.certificateType = 'verified';
      const tree = renderer.create((
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>
      )).toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for unknown seat type', () => {
      product.certificateType = null;
      const tree = renderer.create((
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>
      )).toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for honor certificate', () => {
      product.certificateType = 'honor';
      const tree = renderer.create((
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>
      )).toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for audit certificate', () => {
      product.certificateType = 'audit';
      const tree = renderer.create((
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>
      )).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
