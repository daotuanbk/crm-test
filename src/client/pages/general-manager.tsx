import React from 'react';
import 'firebase/auth';
import { NextContext } from 'next';
import { GeneralManagerScreen } from '../modules/general-manager';

interface Props { }
interface State { }
class GeneralManagerPage extends React.Component<Props, State> {
  static async getInitialProps(_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render() {
    return (
      <GeneralManagerScreen />
    );
  }
}

export default (GeneralManagerPage);
