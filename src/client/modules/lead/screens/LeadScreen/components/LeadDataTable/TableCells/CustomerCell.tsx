import React from 'react';
import { Popover } from 'antd';
import { translate } from '@client/i18n';
import _ from 'lodash';

const NamePopover = (props: any) => {
  const {
    record,
  } = props;
  const customerInfo = _.get(record, 'customer._id', {});

  return (
    <div>
      <h5><span className='text-gray'>{translate('lang:email')}:</span> {customerInfo.email || 'N/A'} </h5>
      <h5><span className='text-gray'>{translate('lang:address')}:</span> {customerInfo.address || 'N/A'} </h5>
    </div>
  );
};

export const CustomerCell = (props: any) => {
  if (!_.get(props, 'record.customer._id')) {
    return <div>N/A</div>;
  }
  const {
    record,
  } = props;
  const customerInfo = _.get(record, 'customer._id', {});
  let customerName = 'N/A';

  if (customerInfo.fullName && customerInfo.fullName.trim()) {
    customerName = customerInfo.fullName;
  } else if (customerInfo.lastName && customerInfo.lastName.trim() || customerInfo.firstName && customerInfo.firstName.trim()) {
    customerName = `${customerInfo.lastName} ${customerInfo.firstName}`;
  }

  return (
    <Popover title='' trigger='hover' content={<NamePopover {...props} />}>
      {customerName}
    </Popover>
  );
};
