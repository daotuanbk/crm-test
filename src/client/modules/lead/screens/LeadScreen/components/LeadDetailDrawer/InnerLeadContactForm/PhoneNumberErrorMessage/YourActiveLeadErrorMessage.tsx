import React from 'react';
import { Button } from 'antd';
import { Lead, Customer } from '@client/services/service-proxies';
import _ from 'lodash';

interface Props {
  errorMessage: string;
  existedActiveLead: Lead;
  getExistedActiveLead?: () => Promise<void>;
  onChange: (values: (Customer|Lead)) => void;
  setValues: (values: (Customer|Lead)) => void;
}

export const YourActiveLeadErrorMessage = (props: Props) => {
  const { errorMessage, existedActiveLead, onChange, setValues, getExistedActiveLead } = props;

  return (
    <div>
      {errorMessage}
      <div style={{color: 'rgba(0, 0, 0, 0.65)'}}>
        <div>
          Lead status: <b>{_.get(existedActiveLead, 'v2Status')}</b>
        </div>
        <div>
          Lead owner: <b>you</b>
        </div>
      </div>
      <div style={{color: 'rgba(0, 0, 0, 0.65)'}}>
        <i>There is an active lead linked with this contact, edit this lead instead?</i>
      </div>
      <div style={{margin: '8px 0px', textAlign: 'right'}}>
        <Button
          type='primary'
          onClick={async () => {
            if (getExistedActiveLead) {
              await getExistedActiveLead();
            }
            setValues({
              ..._.get(existedActiveLead, 'customer._id', {}),
              channel: _.get(existedActiveLead, 'channel'),
              source: _.get(existedActiveLead, 'source'),
              campaign: _.get(existedActiveLead, 'campaign'),
              medium: _.get(existedActiveLead, 'medium'),
              content: _.get(existedActiveLead, 'content'),
            });
            onChange(existedActiveLead);
          }}
        >
          Yes
        </Button>
      </div>
    </div>
  );
};
