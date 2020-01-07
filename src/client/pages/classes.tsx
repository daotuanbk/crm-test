import React from 'react';
import { ClassScreen } from '../modules/class';
import { NextContext } from 'next';

interface Props {}
interface State {}
class ClassesPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <ClassScreen />
    );
  }
}

export default (ClassesPage);
