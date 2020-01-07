import React from 'react';
import { LeadScreen as GMLeadScreen } from './GM';
import { LeadScreen as SalesHOLeadScreen } from './SalesHO';
import { LeadScreen as SalesmanLeadScreen } from './SalesMan';
import { LeadScreen as AccountantLeadScreen } from './Accountant';
import { Authorize } from '@client/components';
import { withRematch, initStore } from '@client/store';
import { PERMISSIONS } from '@common/permissions';

export const Screen = (props: any) => {
  const { authUser: { permissions }, id } = props;
  if (permissions.includes(PERMISSIONS.ROLES.GENERALMANAGER)) {
    return <GMLeadScreen {...props} />;
  } else if (permissions.includes(PERMISSIONS.ROLES.SALE_HO)) {
    return <SalesHOLeadScreen {...props} />;
  } else if (permissions.includes(PERMISSIONS.ROLES.SALESMAN)) {
    return <SalesmanLeadScreen {...props} />;
  } else if (permissions.includes(PERMISSIONS.ROLES.ACCOUNTANT)) {
    return <AccountantLeadScreen {...props} />;
  }
  return <div>Unsupported roles</div>;
};

const mapState = (rootState: any) => {
  return {
    authUser: rootState.profileModel.authUser,
  };
};

const mapDispatch = (_rootReducer: any) => {
  return {};
};

const LeadScreen = Authorize(withRematch(initStore, mapState, mapDispatch)(Screen), [PERMISSIONS.LEADS.VIEW_SCREEN], true, 'admin');

export {
  LeadScreen,
};
