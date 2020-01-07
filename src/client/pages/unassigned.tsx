import React from 'react';
import { UnassignLeadScreen } from '../modules/lead';
import { NextContext } from 'next';

interface Props {}
interface State {}
class UnassignedPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <UnassignLeadScreen />
    );
  }
}

export default (UnassignedPage);
