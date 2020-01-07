import React from 'react';
import { CentreScreen } from '../modules/centre';
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
      <CentreScreen />
    );
  }
}

export default (CentresPage);
