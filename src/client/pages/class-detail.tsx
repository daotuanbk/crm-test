import React from 'react';
import { ClassDetailScreen } from '../modules/class';
import { NextContext } from 'next';

interface Props {
  id: string;
}
interface State {}
class ClassDetailPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      id: _context.query.id,
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <ClassDetailScreen _id={this.props.id}/>
    );
  }
}

export default (ClassDetailPage);
