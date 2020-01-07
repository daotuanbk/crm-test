import React from 'react';
import { Authorize } from '@client/components';
import { PERMISSIONS } from '@common/permissions';
import { NotificationDropdown } from '../../../../layouts/Admin/components/NotificationDropdown';

interface State {
}

interface Props {
}
export const LeadNotiTaskScreen = Authorize(class extends React.Component<Props, State> {
  render() {
    return (
        <NotificationDropdown mode={'normalList'}/>
    );
  }
}, [PERMISSIONS.LEAD_NOTIFICATIONS.VIEW], true, 'admin');
