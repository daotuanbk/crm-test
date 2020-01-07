import React from 'react';
import { LeadsForReceptionistScreen } from '../modules/collect-tuition';
import { NextContext } from 'next';

interface Props {
  //
}
interface State {}
class Receptionist extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <LeadsForReceptionistScreen />
    );
  }
}

export default (Receptionist);
