import React from 'react';
import { Table } from 'antd';
import _ from 'lodash';

export interface TableSort {
  field: string;
  order: 'ascend' | 'descend';
}

interface Props {
  rowSelection?: any;
  dataSource: any;
  columns: any;
  loading?: boolean;
  haveRowSelection?: boolean;
  noNeedIndex?: boolean;
  selectedRowKeys?: string[] | number[];
  onSortChange?: (sort: TableSort) => void;
  onSelectionChange?: (selectedRow: any) => void;
  rowClassName?: (record: any) => string;
  rowKeyField?: string;
  scrollY?: string | number;
}

export class TableList extends React.Component<Props, {}> {

  handleChange = (_pagination: any, _filters: any, sort: TableSort) => {
    if (this.props.onSortChange) {
      this.props.onSortChange(sort);
    }
  };

  handleRowSelectionChange = (selectedRowKeys: any, selectedRow: any) => {
    this.setState({
      selectedRowKeys,
    });

    if (this.props.onSelectionChange) {
      this.props.onSelectionChange(selectedRow);
    }
  }

  render() {
    const {
      haveRowSelection,
      noNeedIndex,
      selectedRowKeys,
      rowKeyField,
    } = this.props;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectionChange,
    };

    const localRowKeyField = rowKeyField || '_id';

    const generateRowKey = (record: any, index: number) => {
      const rowKey = _.get(record, localRowKeyField);
      return noNeedIndex ? rowKey : `${rowKey}-${index}`;
    };

    return (
      <div>
        <Table
          {...this.props}
          rowSelection={haveRowSelection ? rowSelection : undefined}
          bordered={true}
          size='small'
          pagination={false}
          rowKey={generateRowKey}
          onChange={this.handleChange}
          scroll={{ x: 'calc(700px + 50%)', y: this.props.scrollY ? this.props.scrollY : 300 }}
        />
      </div>
    );
  }
}
