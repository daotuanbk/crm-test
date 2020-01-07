import React from 'react';
import { RolesScreen } from '../modules/auth';
import { NextContext } from 'next';
import 'firebase/auth';

interface Props {}
interface State {}
class RolesPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <RolesScreen />
    );
  }
}

export default (RolesPage);
