import React from 'react';
import { LeadDetailScreen } from '../modules/lead';
import { NextContext } from 'next';

interface Props {
  id: string;
}
interface State {}
class LeadDetailPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      id: _context.query.id,
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <LeadDetailScreen _id={this.props.id}/>
    );
  }
}

export default (LeadDetailPage);
