import React from 'react';
import { RegisterScreen } from '../modules/auth';
import { NextContext } from 'next';

interface Props {}
interface State {}
class RegisterPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <RegisterScreen />
    );
  }
}

export default (RegisterPage);
