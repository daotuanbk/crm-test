import React from 'react';
import { DashboardScreen } from '../modules/dashboard';
import { NextContext } from 'next';

interface Props {
  //
}
interface State {}
class Dashboard extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <DashboardScreen />
    );
  }
}

export default (Dashboard);
