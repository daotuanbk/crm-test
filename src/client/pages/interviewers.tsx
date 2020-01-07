import React from 'react';
import { InterviewerScreen } from '../modules/interviewers';
import { NextContext } from 'next';
import { getServiceProxy } from '../services';

interface Props {
  users: any[];
  interviewers: any[];
}
interface State {}
class Interviewers extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    const serviceProxy = getServiceProxy();
    const interviewers = await serviceProxy.getAllInterviewers() as any;
    const users = await serviceProxy.getAllUsers() as any;
    return {
      interviewers: interviewers.data,
      users: users.data,
      id: _context.query.id,
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <InterviewerScreen interviewers={this.props.interviewers} users={this.props.users}/>
    );
  }
}

export default (Interviewers);
