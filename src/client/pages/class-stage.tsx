import React from 'react';
import { ClassStageScreen } from '../modules/stage';
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
      <ClassStageScreen />
    );
  }
}

export default (StagePage);
