import React from 'react';
import _ from 'lodash';
import { TableList } from '@client/components';

import {
  TitleCell,
  DescriptionCell,
  CategoryCell,
} from './tableCells';

import { LmsCourse } from '@client/services/service-proxies';

interface Props {
  loading: boolean;
  data: {
    records: any;
    total: number;
  };
}

export const LmsCourseTable = (props: Props) => {
  const columns = [
    {
      title: 'Category',
      field: 'category',
      render: (_value: any, record: LmsCourse) => <CategoryCell record={record} />,
    },
    {
      title: 'Title',
      field: 'title',
      render: (_value: any, record: LmsCourse) => <TitleCell record={record} />,
    },
    {
      title: 'Description',
      field: 'description',
      render: (_value: any, record: LmsCourse) => <DescriptionCell record={record} />,
    },
  ];

  return (
    <div>
      <TableList
        columns={columns}
        haveRowSelection={false}
        noNeedIndex={true}
        dataSource={_.values(props.data.records)}
        loading={props.loading}
      />
    </div>
  );
};
