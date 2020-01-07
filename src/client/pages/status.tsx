import React from 'react';
import { LeadStatusScreen } from '../modules/status';
import { NextContext } from 'next';

interface Props {}
interface State {}
class StatusPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <LeadStatusScreen />
    );
  }
}

export default (StatusPage);
