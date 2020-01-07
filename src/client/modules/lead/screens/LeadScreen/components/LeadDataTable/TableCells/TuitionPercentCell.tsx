import React from 'react';
import { translate } from '@client/i18n';
import { Popover, Progress } from 'antd';
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

export const TuitionPercentCell = (props: any) => {
  const { record } = props;
  const percent = _.get(record, 'tuition.completePercent');
  return (
    <Popover title='' trigger='hover' content={<TuitionPopoverContent {...{ record }} />}>
      <div>
        {
          percent
            ? <h5>{percent} %</h5>
            : <div>N/A</div>
        }
        {
          percent
          &&
          <Progress
            width={40}
            showInfo={false}
            style={{ wordBreak: 'normal' }}
            status='active'
            percent={percent}
          />
        }
      </div>
    </Popover>
  );
};
