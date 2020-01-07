import React from 'react';
import { AuthUser } from '@client/store';
import _ from 'lodash';

interface Props {
  authUser: AuthUser;
  permissions: String | String[],
  children: JSX.Element,
}

export const WithPermission = (props: Props) => {
  const { permissions, authUser } = props;
  const localPermissions: String[] = _.flatten([permissions]); // Convert to array
  const hasPermissions = _(localPermissions).difference(authUser.permissions).isEmpty(); // Check if user has all permission in localPermissions
  if (hasPermissions){
    return props.children;
  }
  return <React.Fragment />;
}