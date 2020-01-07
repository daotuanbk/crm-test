import React from 'react';
import { Lead } from '@client/services/service-proxies';
import _ from 'lodash';

interface Props {
  errorMessage: string;
  existedActiveLead: Lead;
}

export const OtherActiveLeadErrorMessage = (props: Props) => {
  const { errorMessage, existedActiveLead } = props;

  return (
    <div>
      {errorMessage} <br />
      You cant add this lead because it's an active lead and it belongs to other salesman
      <div style={{color: 'rgba(0, 0, 0, 0.65)'}}>
        <div>
          Lead status: <b>{_.get(existedActiveLead, 'v2Status')}</b>
        </div>
        <div>
          Lead owner: <b>{_.get(existedActiveLead, 'owner.fullName')}</b>
        </div>
        <div>
          Centre: <b>{_.get(existedActiveLead, 'centre.name')}</b>
        </div>
      </div>
    </div>
  );
};
