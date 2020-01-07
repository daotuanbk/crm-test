import React from 'react';
import { Button } from 'antd';
import { Customer, Lead } from '@client/services/service-proxies';

interface Props {
  errorMessage: string;
  existedContact: Customer;
  copyExistedContact: () => void;
  selectExistedContact: () => void;
  onChange: (values: (Customer|Lead)) => void;
}

export const NotActiveLeadErrorMessage = (props: Props) => {
  const { errorMessage, copyExistedContact, selectExistedContact, onChange, existedContact } = props;

  return (
    <div>
      {errorMessage}
      <div style={{color: 'rgba(0, 0, 0, 0.65)'}}>
        Do you want to copy information of "Customer" and "Family"?
      </div>
      <div style={{margin: '8px 0px', textAlign: 'right'}}>
        <Button
          type='primary'
          onClick={() => {
            copyExistedContact();
            selectExistedContact();
            onChange({customer: existedContact} as any);
          }}
        >
          Copy
        </Button>
      </div>
    </div>
  );
};
