import React from 'react';
import { AddLeadScreen } from '../modules/lead';
import { NextContext } from 'next';

interface Props {
  centres: any;
  users: any;
  stages: any;
  statuses: any;
  courses: any;
  combos: any;
  salesmen: any;
}
interface State {}
class LeadDetailPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <AddLeadScreen />
    );
  }
}

export default (LeadDetailPage);
