import React from 'react';
import { ReceptionistScreen } from '../modules/collect-tuition';
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
      <ReceptionistScreen />
    );
  }
}

export default (UsersPage);
