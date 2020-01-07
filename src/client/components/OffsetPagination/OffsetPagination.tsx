import React from 'react';
import { Pagination } from 'antd';

interface Props {
  page: any;
  pageSize: any;
  total?: any;
  totalPages?: any;
  children?: never[];
  changePageOffsetPagination?: (pageNumber: number) => void;
  changePageSizeOffsetPagination?: (pageSize: number) => void;
}

export const OffsetPagination = (props: Props) => {
  const onShowSizeChange = (_current: number, itemPerPage: number) => {
    props.changePageSizeOffsetPagination(itemPerPage);
  };
  const handleOnChange = (current: number) => {
    props.changePageOffsetPagination(current);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
      <h3 style={{ marginLeft: '11px', fontSize: '19px' }}>Total: {props.total}</h3>
      <Pagination
        showSizeChanger
        current={props.page}
        total={props.total}
        onShowSizeChange={onShowSizeChange}
        onChange={handleOnChange}
      />
    </div>
  );
};
