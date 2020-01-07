import React from 'react';
import { NextContext } from 'next';
import { ProductsScreen } from '../modules/products';

interface Props {}

interface State {}

class ProductsPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <ProductsScreen />
    );
  }
}

export default (ProductsPage);
