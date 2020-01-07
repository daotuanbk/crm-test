import React from 'react';
import { Customer, Lead } from '@client/services/service-proxies';
import { InnerLeadContactForm } from '../InnerLeadContactForm';
import _ from 'lodash';
import { FormikContext } from 'formik';
import { AuthUser } from '@client/store';

interface Props {
  context: FormikContext<any>;
  leadId: string;
  loading: boolean;
  existedContact?: Customer;
  selectedContact?: Customer;
  existedActiveLead?: Lead;
  showRelationPicker: boolean;
  phoneEditDisabled: boolean;
  authUser: AuthUser;
  isFamilyTab: boolean;
  getExistedActiveLead?: () => Promise<void>;
  selectExistedContact?: () => void;
  onChange: (values: (Customer|Lead)) => void;
}

export const LeadNewContactForm = (props: Props) => {
  return (
    <InnerLeadContactForm
      context={props.context}
      showRelationPicker={props.showRelationPicker}
      phoneEditDisabled={props.phoneEditDisabled}
      existedContact={props.existedContact}
      selectedContact={props.selectedContact}
      existedActiveLead={props.existedActiveLead}
      isFamilyTab={props.isFamilyTab}
      authUser={props.authUser}
      getExistedActiveLead={props.getExistedActiveLead}
      selectExistedContact={props.selectExistedContact}
      onChange={props.onChange}
    />
  );
};
