import React from 'react';
import { DateRangeSelect } from '@client/components';

interface Props {
  style: any;
}

export const ReminderFilter = (props: Props) => {
  const { style, ...restProps } = props;
  return (
    <DateRangeSelect
      {...restProps}
      label='Reminder'
      style={style}
    />
  );
};
