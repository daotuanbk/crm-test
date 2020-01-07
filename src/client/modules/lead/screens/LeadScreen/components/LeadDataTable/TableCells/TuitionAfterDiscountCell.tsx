import React from 'react';
import { translate } from '@client/i18n';
import { Popover } from 'antd';
import _ from 'lodash';

const TuitionPopoverContent = (props: any) => {
  const { record } = props;
  return (
    <div>
      <h5><span className='text-gray'>{translate('lang:tuitionAfterDiscount')}:</span> {record.tuition ? Number(record.tuition.totalAfterDiscount).toLocaleString() + ' VND' : 0}</h5>
      <h5><span className='text-gray'>{translate('lang:collected')}:</span>
        {record.tuition ? Number(record.tuition.totalAfterDiscount - record.tuition.remaining).toLocaleString() + ' VND' : 0}</h5>
      <h5><span className='text-red'>{translate('lang:remaining')}:</span> {record.tuition ? Number(record.tuition.remaining).toLocaleString() + ' VND' : 0}</h5>
    </div>
  );
};

const moneyFormat = (num: number): string => {
  if (num > 999999) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num > 999) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toFixed();
  }
};

export const TuitionAfterDiscountCell = (props: any) => {
  const { record } = props;
  const tuitionAfterDiscount = _.get(record, 'tuition.totalAfterDiscount', null);
  const tuitioAfterDiscountString = tuitionAfterDiscount
    ? moneyFormat(tuitionAfterDiscount) + ' VNĐ'
    : 'N/A';
  return (
    <Popover
      title=''
      trigger='hover'
      content={<TuitionPopoverContent {...{record}} />}
    >
      <span>{tuitioAfterDiscountString}</span>
    </Popover>
  );
};
