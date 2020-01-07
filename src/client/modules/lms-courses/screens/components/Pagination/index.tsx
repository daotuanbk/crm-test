import React from 'react';
import { Pagination as AntPagination } from 'antd';
import { Pagination } from '@client/core';

interface Props {
  pagination: Pagination;
  total: number;
  children?: never[];
  onPaginationChange: (paginationData: Pagination) => void;
}

export class LmsCoursePagination extends React.Component<Props, {}> {
  handleChange = (page: number) => {
    const { pagination } = this.props;
    this.props.onPaginationChange({
      ...pagination,
      page,
    });
  }

  handleShowSizeChange = (_page: number, pageSize: number) => {
    const { pagination } = this.props;
    this.props.onPaginationChange({
      ...pagination,
      pageSize,
      page: 0,
    });
  }

  render() {
    const {
      total,
      pagination: {
        page,
        pageSize,
      },
    } = this.props;

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
        <h3 style={{ marginLeft: '11px', fontSize: '19px' }}>Total: {total}</h3>
        <AntPagination
          showSizeChanger
          current={page}
          total={total}
          pageSize={pageSize}
          onShowSizeChange={this.handleShowSizeChange}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}
