import React from 'react';
import { Popover } from 'antd';
import _ from 'lodash';

const CentrePopover = (props: any) => {
  const { record } = props;
  return (
    <div>
      <h4>{_.get(record, 'centre.name', 'N/A')}</h4>
    </div>
  );
};

interface Lead {
  _id: string;
  centre: {
    _id: string,
    name: string,
    shortName: string,
  };
}

interface Props {
  onLeadChange: (lead: Lead) => void;
  record: Lead;
}

export const CentreCell = (props: Props) => {
  const { record } = props;
  const centreShortName = _.get(record, 'centre.shortName', 'N/A');
  return (
    <Popover
      title=''
      trigger='hover'
      content={ <CentrePopover record={record} /> }
    >
      <span>{centreShortName}</span>
    </Popover>
  );
};
