import React from 'react';
import { Select, Spin } from 'antd';
import _ from 'lodash';

interface Props {
  options: any[];
  label: string;
  placeholder?: string;
  displayField?: string;
  valueField?: string;
  style?: {};
  loading: boolean;
  onChange: (value: any) => any;
  onSearch: (value: any) => void;
}

export const SingleSelectWithSearch = (props: Props) => {
  // One line because of TS and Linter disagree on trailiing comma, fuckers
  // https://github.com/palantir/tslint/issues/4172
  const { style = {}, ...restProps } = props;
  const {
    options,
    label,
    displayField = 'display',
    valueField = 'value',
    onSearch,
    loading,
  } = restProps;
  const debouncedSearch = _.debounce(onSearch, 300);
  return (
    <div style={{ ...style, marginTop: '10px' }}>
      <h6 style={{ fontSize: '14px', fontWeight: 'normal' }}>{ label }</h6>
      <Select
        allowClear
        mode='default'
        defaultValue={undefined}
        showSearch
        style={{ minWidth: '7rem' }}
        onSearch={debouncedSearch}
        filterOption={false}
        notFoundContent={loading ? <Spin size='small' /> : null}
        dropdownMatchSelectWidth={false}
        {...restProps}
      >
        {
          options.map((option: any, i: number) => (
            <Select.Option
              value={option[valueField]}
              key={option[valueField]}
            >
              {option[displayField]}
            </Select.Option>
          ))
        }
      </Select>
    </div>
  );
};
