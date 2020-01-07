import React from 'react';
import { MultiSelect } from '@client/components';
import _ from 'lodash';

interface Props {
  style: object;
  options: any[];
}

export const StatusFilter = (props: Props) => {
  const { style, ...restProps} = props;
  return (
    <MultiSelect
      {...restProps}
      label='Status'
      placeholder='L2A, L3B'
      dropdownMatchSelectWidth={false}
      style={{ ...style}}
    />
  );
};
