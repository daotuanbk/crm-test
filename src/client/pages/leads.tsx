import React from 'react';
import { LeadScreen } from '../modules/lead';
import { NextContext } from 'next';

interface Props {
  id?: string;
}

interface State {}

class LeadsPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
      id: _context.query.id,
    };
  }

  render () {
    return (
      <LeadScreen id={this.props.id} />
    );
  }
}

export default (LeadsPage);
