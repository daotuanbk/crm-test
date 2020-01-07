import React from 'react';
import { UsersScreen } from '../modules/auth';
import 'firebase/auth';
import { NextContext } from 'next';

interface Props {}
interface State {}
class UsersPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <UsersScreen />
    );
  }
}

export default (UsersPage);
