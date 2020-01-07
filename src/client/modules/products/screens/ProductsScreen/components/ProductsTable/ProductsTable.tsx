import React from 'react';
import _ from 'lodash';
import { TableList, CreatedAtCell, TableSort } from '@client/components';
import { ProductCodeCell } from '../ProductCodeCell/ProductCodeCell';
import { ProductNameCell } from '../ProductNameCell/ProductNameCell';
import { ProductPriceCell } from '../ProductPriceCell/ProductPriceCell';
import { ProductTypeCell } from '../ProductTypeCell/ProductTypeCell';
import { LimitedCourseCell } from '../LimitedCourseCell/LimitedCourseCell';
import { LimitedDurationCell } from '../LimitedDurationCell/LimitedDurationCell';
import { CategoryCell } from '../CategoryCell/CategoryCell';
import { ProductLineCell } from '../ProductLineCell/ProductLineCell';
import { StatusCell } from '../StatusCell/StatusCell';
import { EditProductCell } from '../EditProductCell/EditProductCell';
import { Product } from '@client/services/service-proxies';

interface Props {
  loading: boolean;
  data: {
    products: any;
    total: number;
  };
  openProductDetailDrawer: (record: Product) => void;
  updateSortAndReload: (sort: TableSort) => void;
}

export const ProductsTable = (props: Props) => {
  const productTableColumns = [
    {
      title: 'Product code',
      field: 'code',
      render: (_value: any, record: Product) => <ProductCodeCell record={record} />,
    },
    {
      title: 'Product name',
      field: 'name',
      render: (_value: any, record: Product) => <ProductNameCell record={record} />,
    },
    {
      title: 'Price',
      field: 'price',
      render: (_value: any, record: Product) => <ProductPriceCell record={record} />,
      sorter: true,
    },
    {
      title: 'Product type',
      field: 'type',
      render: (_value: any, record: Product) => <ProductTypeCell record={record} />,
    },
    {
      title: 'Limited course',
      field: 'limitedCourse',
      render: (_value: any, record: Product) => <LimitedCourseCell record={record} />,
      sorter: true,
    },
    {
      title: 'Limited duration',
      field: 'limitedDuration',
      render: (_value: any, record: Product) => <LimitedDurationCell record={record} />,
      sorter: true,
    },
    {
      title: 'Product category',
      field: 'category',
      render: (_value: any, record: Product) => <CategoryCell record={record} />,
    },
    {
      title: 'Product line',
      field: 'productLine',
      render: (_value: any, record: Product) => <ProductLineCell record={record} />,
    },
    {
      title: 'Status',
      field: 'status',
      render: (_value: any, record: Product) => <StatusCell record={record} />,
    },
    {
      title: 'Created At',
      field: 'createdAt',
      render: (_value: any, record: Product) => <CreatedAtCell record={record} />,
    },
    {
      title: '',
      key: 'edit',
      dataIndex: 'edit',
      render: (_value: any, record: Product) => <EditProductCell openProductDetailDrawer={() => props.openProductDetailDrawer(record)} />,
    },
  ];

  return (
    <div>
      <TableList
        columns={productTableColumns}
        haveRowSelection={true}
        noNeedIndex={true}
        dataSource={_.values(props.data.products)}
        loading={props.loading}
        onSortChange={props.updateSortAndReload}
      />
    </div>
  );
};
