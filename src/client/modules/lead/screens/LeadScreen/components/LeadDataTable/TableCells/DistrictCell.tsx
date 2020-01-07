import React from 'react';
import _ from 'lodash';

export const DistrictCell = (props: any) => {
  const {
    record,
  } = props;
  const customerInfo = _.get(record, 'customer._id', {});
  return (
    <span>
      {customerInfo && customerInfo.address ? customerInfo.address : 'N/A'}
    </span>
  );
};
