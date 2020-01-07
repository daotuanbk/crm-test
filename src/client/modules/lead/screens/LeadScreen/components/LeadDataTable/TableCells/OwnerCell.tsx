import React from 'react';
import _ from 'lodash';
interface Lead {
  _id: string;
  owner: {
    id: string,
    fullName: string,
  };
}

interface Props {
  record: Lead;
}

export const OwnerCell = (props: Props) => {
  const { record } = props;
  const onwerFullName = _.get(record, 'owner.fullName', 'N/A');
  return (
    <span>{onwerFullName}</span>
  );
};
