import React from 'react';
import { LeadStageScreen } from '../modules/stage';
import { NextContext } from 'next';

interface Props {}
interface State {}
class StagePage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <LeadStageScreen />
    );
  }
}

export default (StagePage);
