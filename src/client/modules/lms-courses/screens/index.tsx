import React from 'react';
import { Authorize, BorderWrapper } from '@client/components';
import { withRematch, initStore } from '@client/store';
import { PERMISSIONS } from '@common/permissions';
import {
  Row,
  Col,
  notification,
  Button,
  Icon,
} from 'antd';
import { LmsCourseSearchBar } from './components/SearchBar';
import { LmsCourseTable } from './components/DataTable';
import { FilterSet, FilterSetData } from './components/FilterSet';
import { LmsCoursePagination } from './components/Pagination';
import { Pagination, getErrorMessage } from '@client/core';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import _ from 'lodash';

interface Props {}

interface State {
  filters: FilterSetData;
  search: string;
  data: {
    records: any;
    total: number;
  };
  pagination: Pagination;
  loading: {
    table: boolean;
  };
}

class Screen extends React.Component<Props, State> {
  state: State = {
    filters: {
      lmsCategory: [],
    },
    search: '',
    data: {
      records: {},
      total: 0,
    },
    pagination: {
      page: 1,
      pageSize: 20,
    },
    loading: {
      table: false,
    },
  };

  componentDidMount() {
    this.fetchRecords();
  }

  fetchRecords = async () => {
    const {
      filters: {
        lmsCategory,
      },
      search,
      pagination: {
        page,
        pageSize,
      },
    } = this.state;

    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });

    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const response = await serviceProxy.findLmsCourses(
        search,
        lmsCategory,
        pageSize,
        page,
        undefined,
      );

      this.setState({
        data: {
          records: _.mapKeys(response.data, '_id'),
          total: response.count,
        },
      });
    } catch (error) {
      notification.error({
        message: 'Error',
        description: getErrorMessage(error),
        placement: 'bottomRight',
      });
    } finally {
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    }
  };

  onSearchChange = (newSearchValue: string) => {
    this.setState({
      search: newSearchValue,
    });
  };

  showProductFromAutocomplete = (record: any) => {
    this.setState({
      pagination: {
        ...this.state.pagination,
        page: 1,
      },
      data: {
        records: { [record._id]: record },
        total: 1,
      },
    });
  };

  updateSearchAndReload = (search: string) => {
    const { pagination } = this.state;
    this.setState({
      search,
      pagination: {
        ...pagination,
        page: 1,
      },
    }, () => this.fetchRecords());
  };

  updatePaginationAndReload = (pagination: Pagination) => {
    this.setState({
      pagination,
    }, () => this.fetchRecords());
  };

  updateFilterAndReload = (filters: FilterSetData) => {
    this.setState({
      filters,
    }, () => this.fetchRecords());
  }

  render() {
    return (
      <div>
        <Row>
          <Col xs={12} sm={16} >
            <h2 style={{ marginBottom: 24 }}>All Courses</h2>
          </Col>
        </Row>

        <BorderWrapper>
          <div style={{ width: '100%', marginBottom: '0.5rem', display: 'flex' }}>
            <div style={{ width: '100%', flexGrow: 1 }}>
              <LmsCourseSearchBar
                search={this.state.search}
                selectFromAutocomplete={this.showProductFromAutocomplete}
                onSearch={this.updateSearchAndReload}
              />
            </div>
            <Button
              style={{ marginLeft: '1rem' }}
              onClick={this.fetchRecords}
            >
              <Icon type='reload' />
              <span>Reload</span>
            </Button>
          </div>
          <FilterSet
            style={{ marginBottom: '1rem' }}
            onFilter={this.updateFilterAndReload}
          />
          <Row style={{ width: '100%' }}>
            <Col xs={24}>
              <LmsCourseTable
                loading={this.state.loading.table}
                data={this.state.data}
              />

              <LmsCoursePagination
                pagination={this.state.pagination}
                total={this.state.data.total}
                onPaginationChange={this.updatePaginationAndReload}
              />
            </Col>
          </Row>
        </BorderWrapper>
      </div>
    );
  }
}

const mapState = (rootState: any) => {
  return {
    authUser: rootState.profileModel.authUser,
  };
};

const mapDispatch = (_rootReducer: any) => {
  return {};
};

export const LmsCourseScreen = Authorize(withRematch(initStore, mapState, mapDispatch)(Screen), [PERMISSIONS.LMS_COURSES.VIEW], true, 'admin');
