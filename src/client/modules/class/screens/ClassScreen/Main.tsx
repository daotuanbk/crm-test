import React from 'react';
import './ClassScreen.less';
import { Col, Row, Spin, Tag } from 'antd';
import { ToolbarWithSuggest, TableList } from '@client/components';
import moment from 'moment';
import { translate } from '@client/i18n';

interface State {
  selectedRowKeys: any;
}

interface Props {
  data: any;
  loading: boolean;
  handleSearch: (data?: any) => void;
  filterTree: {
    label: string;
    value: string;
    children: { label: string; value: string }[];
  }[];
  filters: {
    key: {
      label: string; value: string
    };
    value: {
      label: string; value: any
    };
  }[];
  search: string;
  sortBy: string;
  addFilter: (newFilter: any) => void;
  removeFilter: (filter: any) => void;
}

export class Main extends React.Component<Props, State> {
  state: State = {
    selectedRowKeys: [],
  };

  renderTable = () => {
    if (this.props.loading) {
      return (
        <div style={{
          width: '100%',
          minHeight: '100px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}><Spin /></div>
      );
    }
    const classColumns = [{
      title: translate('lang:name'),
      key: 'name',
      dataIndex: 'name',
      width: '13%',
      render: (_value: any, record: any) => <a href={`/class-detail/${record._id}`}>{record.name}</a>,
    }, {
      title: translate('lang:description'),
      key: 'description',
      dataIndex: 'description',
      width: '20%',
    }, {
      title: translate('lang:startTime'),
      key: 'startTime',
      dataIndex: 'startTime',
      render: (value: any) => value ? moment(value).format('DD MMM YYYY') : '',
      width: '15%',
    }, {
      title: translate('lang:endTime'),
      key: 'endTime',
      dataIndex: 'endTime',
      render: (value: any) => value ? moment(value).format('DD MMM YYYY') : '',
      width: '15%',
    }, {
      title: translate('lang:studentTotal'),
      key: 'studentTotal',
      dataIndex: 'studentTotal',
      render: (_value: any, record: any) => <span style={{ color: record.students >= record.minStudents ? '#1890ff' : 'red' }}>
        {record.students}
      </span>,
      width: '12%',
    }, {
      title: translate('lang:tuition'),
      key: 'tuition',
      dataIndex: 'tuition',
      render: (_value: any, record: any) => <span style={{ color: record.tuitionPercent >= 100 ? '#1890ff' : 'red' }}>
        {(record.tuitionPercent || 0) + '%'}
      </span>,
      width: '10%',
    }, {
      title: translate('lang:centre'),
      key: 'centreId',
      dataIndex: 'centreId',
      render: (_value: any, record: any) => record && record.centreId && record.centreId.name ? record.centreId.name : '',
      width: '15%',
    }];

    return (
      <Col xs={24}>
        <TableList columns={classColumns} dataSource={this.props.data} />
      </Col>
    );
  }
  render() {
    const sortData = [{
      value: 'name|asc',
      label: 'Name (Ascending)',
    }, {
      value: 'name|desc',
      label: 'Name (Descending)',
    }, {
      value: 'startTime|asc',
      label: 'Start time (Ascending)',
    }, {
      value: 'startTime|desc',
      label: 'Start time (Descending)',
    }];
    return (
      <div className='class-screen-container'>
        <Row type='flex' style={{ marginBottom: 16 }} justify='space-between'>
          <ToolbarWithSuggest name='classes' data={this.props.filterTree}
            filters={this.props.filters} handleFilterChange={this.props.addFilter} sortData={sortData} disableFilter={false} callback={this.props.handleSearch}
            searchAutoCompleteSource={async () => false} selectFromAutocomplete={() => false}
            sortBy={this.props.sortBy}
          />
        </Row>
        {this.props.filters.length || this.props.search
          ? <Row className='selected-filters' style={{ marginBottom: 16 }}>
            <Col xs={24}>
              {this.props.filters && this.props.filters.map((filter, index: number) => (
                <Tag
                  key={index.toString()}
                  color='magenta'
                  closable={true}
                  onClose={(e: any) => {
                    e.preventDefault();
                    this.props.removeFilter(filter);
                  }}
                >
                  {filter.key.label}: {filter.key.value === 'createdAt' || filter.key.value === 'startTime' ?
                    `${filter.value.value && filter.value.value.$gte ? `${translate('lang:start')}: ${moment(filter.value.value.$gte).format('DD/MM/YYYY')}` : ''}
                ${filter.value.value && filter.value.value.$lte ? `${filter.value.value && filter.value.value.$gte ?
                      ' - ' : ''}${translate('lang:end')}: ${moment(filter.value.value.$lte).format('DD/MM/YYYY')}` : ''}`
                    : filter.value.label}
                </Tag>
              ))}
              {this.props.search && (
                <Tag
                  key='keyword'
                  color='magenta'
                  closable={true}
                  onClose={(e: any) => {
                    e.preventDefault();
                    this.props.handleSearch({ search: '' });
                  }}
                >
                  {translate('lang:keyword')}: {this.props.search}
                </Tag>
              )}
            </Col>
          </Row> : null}
        <Row type='flex'>
          {
            this.renderTable()
          }
        </Row>
      </div>
    );
  }
}
