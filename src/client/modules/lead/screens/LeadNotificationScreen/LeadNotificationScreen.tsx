import React from 'react';
import { Authorize } from '@client/components';
import { PERMISSIONS } from '@common/permissions';
import { MessageDropdown } from '../../../../layouts/Admin/components/MessageDropdown';

interface State {
}

interface Props {
}
export const LeadNotificationScreen = Authorize(class extends React.Component<Props, State> {
  render() {
    return (
        <MessageDropdown mode={'normalList'}/>
    );
  }
}, [PERMISSIONS.LEAD_NOTIFICATIONS.VIEW], true, 'admin');
