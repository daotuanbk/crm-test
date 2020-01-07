import React from 'react';
import { LeadNotiTaskScreen } from '../modules/lead/screens/LeadNotificationScreen/LeadNotiTaskScreen';
import { NextContext } from 'next';

interface Props {}
interface State {}
class NotificationsPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }
  render () {
    return (
      <LeadNotiTaskScreen />
    );
  }
}

export default (NotificationsPage);
