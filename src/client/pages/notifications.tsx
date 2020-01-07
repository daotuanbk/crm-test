import React from 'react';
import { LeadNotificationScreen } from '../modules/lead/screens/LeadNotificationScreen/LeadNotificationScreen';
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
      <LeadNotificationScreen />
    );
  }
}

export default (NotificationsPage);
