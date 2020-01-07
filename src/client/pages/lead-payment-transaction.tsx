import React from 'react';
import { PaymentTransactionScreen } from '../modules/collect-tuition';
import { NextContext } from 'next';

interface Props {
  id: string;
}
interface State {}
class ListDetailPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      id: _context.query.id,
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <PaymentTransactionScreen id={this.props.id}/>
    );
  }
}

export default (ListDetailPage);
