import React from 'react';
import moment from 'moment';
import _ from 'lodash';

export const CreatedAtCell = (props: any) => {
  const {
    record,
  } = props;
  return (
    <span>
      {moment(record.createdAt).format('DD/MM/YY hh:mm a')}
    </span>
  );
};
