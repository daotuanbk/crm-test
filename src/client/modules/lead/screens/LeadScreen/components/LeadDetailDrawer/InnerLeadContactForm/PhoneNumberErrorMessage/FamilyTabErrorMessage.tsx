import React from 'react';
import { Button } from 'antd';

interface Props {
  errorMessage: string;
  copyExistedContact: () => void;
  selectExistedContact: () => void;
}

export const FamilyTabErrorMessage = (props: Props) => {
  const { errorMessage, copyExistedContact, selectExistedContact } = props;

  return (
    <div>
      {errorMessage}. Do you want to copy information?
      <div style={{margin: '8px 0px', textAlign: 'right'}}>
        <Button
          type='primary'
          onClick={() => {
            copyExistedContact();
            selectExistedContact();
          }}
        >
          Copy
        </Button>
      </div>
    </div>
  );
};
