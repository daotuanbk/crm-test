import React, { createRef } from 'react';
import { Select } from 'antd';

interface Props {
  options: any[];
  label: string;
  placeholder?: string;
  displayField?: string;
  valueField?: string;
  maxTagCount?: number;
  dropdownMatchSelectWidth?: boolean;
  style?: any;
  loading?: boolean;
  onChange?: (value: any) => void;
  onSelect?: (item: any) => void;
  onDeselect?: (item: any) => void;
}

const MultiSelect = (props: Props) => {
  // One line because of TS and Linter disagree on trailiing comma, fuckers
  // https://github.com/palantir/tslint/issues/4172
  const { style = {}, ...restProps } = props;
  const {
    options,
    label,
    displayField = 'display',
    valueField = 'value',
    loading,
  } = restProps;
  const selectInput = createRef<any>();

  return (
    <div style={{ ...style, marginTop: '10px'}}>
      <h6 style={{ fontSize: '14px', fontWeight: 'normal' }}>{ label }</h6>
      <Select
        allowClear
        ref={selectInput}
        mode='multiple'
        style={{ minWidth: '6rem' }}
        loading={loading}
        onInputKeyDown={(e) => {
          if (e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
            selectInput.current.blur();
            return;
          }
        }}
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

export { MultiSelect };
