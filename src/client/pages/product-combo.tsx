import React from 'react';
import { ProductComboScreen } from '../modules/product-combo';
import { NextContext } from 'next';

interface Props {}
interface State {}
class ProductComboPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <ProductComboScreen />
    );
  }
}

export default (ProductComboPage);
