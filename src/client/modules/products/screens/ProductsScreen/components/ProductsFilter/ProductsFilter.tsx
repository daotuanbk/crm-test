import React from 'react';
import { Button, Icon } from 'antd';
import { MultiSelect, SingleSelect } from '@client/components';
import { ProductType, ProductCategory, ProductLine } from '@client/services/service-proxies';
import { nestBasic } from '@client/core';
import { ProductFilters } from '../../ProductsScreen';

interface Props {
  filter: ProductFilters;
  handleFilterChange: (filter: Partial<ProductFilters>) => void;
  clearFilter: () => void;
}

const itemStyle = {
  marginRight: '1rem',
  marginBottom: '1rem',
};

const productTypeFilterOptions = [{
  value: ProductType.Combo,
  display: ProductType.Combo,
}, {
  value: ProductType.Single,
  display: ProductType.Single,
}, {
  value: ProductType.Special,
  display: ProductType.Special,
}];

const productCategoryFilterOptions = [{
  value: ProductCategory.Teens,
  display: ProductCategory.Teens,
}, {
  value: ProductCategory.Kids,
  display: ProductCategory.Kids,
}, {
  value: '18+',
  display: '18+',
}];

const productLineFilterOptions = [{
  value: ProductLine.App,
  display: ProductLine.App,
}, {
  value: ProductLine.C4E,
  display: ProductLine.C4E,
}, {
  value: ProductLine.Data,
  display: ProductLine.Data,
}, {
  value: ProductLine.Game,
  display: ProductLine.Game,
}, {
  value: ProductLine.Other,
  display: ProductLine.Other,
}, {
  value: ProductLine.Web,
  display: ProductLine.App,
}];

const productStatusFilterOptions = [{
  value: true,
  display: 'Active',
}, {
  value: false,
  display: 'Deactive',
}];

export const ProductsFilter = (props: Props) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <MultiSelect
        options={productTypeFilterOptions}
        label='Type'
        placeholder='Single, Combo'
        dropdownMatchSelectWidth={false}
        style={itemStyle}
        {...nestBasic('type')({value: props.filter, onChange: props.handleFilterChange})}
      />

      <MultiSelect
        options={productCategoryFilterOptions}
        label='Category'
        placeholder='Kids, Teen'
        dropdownMatchSelectWidth={false}
        style={itemStyle}
        {...nestBasic('category')({value: props.filter, onChange: props.handleFilterChange})}
      />

      <MultiSelect
        options={productLineFilterOptions}
        label='Product line'
        placeholder='Web, Game'
        dropdownMatchSelectWidth={false}
        style={itemStyle}
        {...nestBasic('productLine')({value: props.filter, onChange: props.handleFilterChange})}
      />

      <SingleSelect
        options={productStatusFilterOptions}
        label='Status'
        placeholder='Active'
        style={itemStyle}
        {...nestBasic('isActive')({value: props.filter, onChange: props.handleFilterChange})}
      />

      <Button onClick={props.clearFilter} style={{ ...itemStyle }}>
        <Icon type='delete' theme='filled' />
        Clear filters
      </Button>
    </div>
  );
};
