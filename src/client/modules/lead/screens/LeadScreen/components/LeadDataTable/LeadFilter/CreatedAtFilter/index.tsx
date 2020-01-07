import React from 'react';
import { DateRangeSelect } from '@client/components';

interface Props {
  style: any;
}

export const CreatedAtFilter = (props: Props) => {
  const { style, ...restProps } = props;
  return (
    <DateRangeSelect
      {...restProps}
      label='Created At'
      style={style}
    />
  );
};
