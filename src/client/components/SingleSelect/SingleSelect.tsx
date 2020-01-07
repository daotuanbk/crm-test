import React from 'react';
import { Select } from 'antd';
import _ from 'lodash';

interface Props {
  options: any[];
  label: string;
  placeholder?: string;
  displayField?: string;
  valueField?: string;
  loading?: boolean;
  style?: {};
}

export const SingleSelect = (props: Props) => {
  // One line because of TS and Linter disagree on trailiing comma, fuckers
  // https://github.com/palantir/tslint/issues/4172
  const { style = {}, ...restProps } = props;
  const {
    options,
    label,
    loading,
    displayField = 'display',
    valueField = 'value',
  } = restProps;
  return (
    <div style={{ ...style, marginTop: '10px' }}>
      <h6 style={{ fontSize: '14px', fontWeight: 'normal' }}>{ label }</h6>
      <Select
        allowClear
        mode='default'
        loading={loading}
        style={{ minWidth: '7rem' }}
        {...restProps}
      >
        {
          options.map((option: any, i: number) => (
            <Select.Option
              value={option[valueField]}
              key={i.toString()}
            >
              {option[displayField]}
            </Select.Option>
          ))
        }
      </Select>
    </div>
  );
};
