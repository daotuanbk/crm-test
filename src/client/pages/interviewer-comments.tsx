import React from 'react';
import { InterviewerScreen } from '../modules/interviewer-comment';
import { NextContext } from 'next';

interface Props {
  id: string;
}
interface State {}
class LeadDetailPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      id: _context.query.id,
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <InterviewerScreen />
    );
  }
}

export default (LeadDetailPage);
