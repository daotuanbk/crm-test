import React from 'react';
import { DefaultTaskScreen } from '../modules/default-task';
import { NextContext } from 'next';

interface Props {}
interface State {}
class CentresPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <DefaultTaskScreen />
    );
  }
}

export default (CentresPage);
