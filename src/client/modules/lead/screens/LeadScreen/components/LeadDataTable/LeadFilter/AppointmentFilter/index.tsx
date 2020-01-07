import React from 'react';
import { DateRangeSelect } from '@client/components';

interface Props {
  style: any;
}

export const AppointmentFilter = (props: Props) => {
  const { style, ...restProps } = props;
  return (
    <DateRangeSelect
      {...restProps}
      label='Appointment'
      style={style}
    />
  );
};
