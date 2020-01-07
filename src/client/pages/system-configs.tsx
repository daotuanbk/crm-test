import React from 'react';
import { SystemConfigScreen } from '../modules/system-config';
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
      <SystemConfigScreen />
    );
  }
}

export default (CentresPage);
