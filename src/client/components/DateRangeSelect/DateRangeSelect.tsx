import React from 'react';
import { DatePicker } from 'antd';

interface Props {
  style?: {};
  label: string;
}

export const DateRangeSelect = (props: Props) => {
  const { style = {}, ...restProps } = props;
  const {
    label,
  } = restProps;
  return (
    <div style={{ marginTop: '10px', ...style }}>
      <h6 style={{ fontSize: '14px', fontWeight: 'normal' }}>{label}</h6>
      <div>
        <DatePicker.RangePicker
          size='default'
          style={{ width: '14rem' }}
          {...restProps}
        />
      </div>
    </div>
  );
};
