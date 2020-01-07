import React, { useState, CSSProperties } from 'react';
import {
  CategoryFilter,
} from './CategoryFilter';
import { nestBasic } from '@client/core';

interface Props {
  onFilter: (filters: FilterSetData) => void;
  style: CSSProperties;
}

export interface FilterSetData {
  lmsCategory: [string] | [];
}

export const FilterSet = (props: Props) => {
  const {
    onFilter,
    style: inputStyle,
  } = props;
  const [filters, setFilters] = useState<FilterSetData>();
  const rootInputProps = {
    value: filters,
    onChange: (newFilters: any) => {
      setFilters(newFilters);
      onFilter(newFilters);
    },
  };

  return (
    <React.Fragment>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        ...inputStyle,
      }}>
        <CategoryFilter
          {...nestBasic('lmsCategory')(rootInputProps)}
        />
      </div>
    </React.Fragment>
  );
};
