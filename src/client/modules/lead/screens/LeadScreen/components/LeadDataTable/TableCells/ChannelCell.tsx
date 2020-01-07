import React from 'react';
import _ from 'lodash';

export const ChannelCell = (props: any) => {
  const {
    record,
  } = props;
  const channel = _.get(record, 'channel');
  return (
    <span>{channel}</span>
  );
};
