import React from 'react';
import _ from 'lodash';
export const PhoneCell = (props: any) => {
  if (!_.get(props, 'record.customer._id')) {
    return <div>N/A</div>;
  }
  const {
    record,
  } = props;
  const customerInfo = _.get(record, 'customer._id', {});

  return (
    <span>{customerInfo && customerInfo.phoneNumber ? customerInfo.phoneNumber : 'N/A'}</span>
  );
};
