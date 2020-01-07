import React from 'react';
import './ClassScreen.less';
import { Authorize, BorderWrapper, Pagination } from '@client/components';
import { message, Row, Col, Button } from 'antd';
import { Main } from './Main';
import { PERMISSIONS } from '@common/permissions';
import { Class } from '@client/services/service-proxies';
import firebase from 'firebase/app';
import { getServiceProxy } from '@client/services';
import moment from 'moment';
import { translate } from '@client/i18n';

interface State {
  search: string;
  data: Class[];
  courses: any;
  filters: { key: { label: string; value: string }; value: { label: string; value: string } }[];
  before: any;
  after: any;
  sortBy: string;
  pageSize: number;
  loading: {
    table: boolean;
  };
}

interface Props {
}

export const ClassScreen = Authorize(class extends React.Component<Props, State> {
  state: State = {
    search: '',
    data: [],
    courses: [],
    filters: [],
    before: undefined,
    after: undefined,
    sortBy: 'startTime|desc',
    pageSize: 10,
    loading: {
      table: false,
    },
  };

  async componentDidMount() {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    this.handleSearch({ search: '' });
    const courses = await serviceProxy.findProductCourse('getAllRecords', undefined, undefined, undefined, undefined, undefined, undefined);
    this.setState({
      courses: courses.data || [],
    });
  }
  handleSearch = async (params: any) => {
    if (this.state.loading.table) return;
    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });

    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const result = await serviceProxy.findClasses(
        undefined,
        params.search || '',
        this.state.filters.map((val: any) => {
          if (val.key.value === '$and') return { [val.key.value]: `${val.key.value}%${val.value.value}` };
          if (val.key.value === 'createdAt' || val.key.value === 'startTime') return { [val.key.value]: `${val.key.value}%${JSON.stringify(val.value.value)}` };
          return { [val.key.value]: `${val.key.value}|${val.value.value}` };
        }),
        this.state.pageSize,
        params.sortBy || this.state.sortBy,
        undefined,
        undefined,
      );
      this.setState({
        search: params.search || '',
        data: result.data,
        before: result.before,
        sortBy: params.sortBy || this.state.sortBy,
        after: result.after,
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    } catch (error) {
      message.error(error.response);
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    }
  }

  loadOtherPage = async (next?: boolean) => {
    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });
    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const result = await serviceProxy.findClasses(
        undefined,
        this.state.search,
        this.state.filters.map((val: any) => {
          if (val && val.key.value === '$and') return { [val.key.value]: `${val.key.value}%${val.value.value}` };
          if (val && val.key.value === 'createdAt' || val.key.value === 'startTime') return { [val.key.value]: `${val.key.value}%${JSON.stringify(val.value.value)}` };
          return { [val.key.value]: `${val.key.value}|${val.value.value}` };
        }),
        this.state.pageSize,
        this.state.sortBy,
        next ? undefined : this.state.before,
        next ? this.state.after : undefined,
      );
      this.setState({
        data: result.data,
        before: result.before,
        after: result.after,
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    } catch (error) {
      message.error(error.response);
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    }
  }

  synchronize = async () => {
    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      await serviceProxy.synchronizeClass();
      message.success(translate('lang:synchronizeSuccess'), 2);
      window.location.reload();
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  }

  addFilter = async (filter: {
    key: {
      label: string; value: string
    };
    value: {
      label: string; value: string
    };
  }) => {
    try {
      this.setState({
        loading: {
          ...this.state.loading,
          table: true,
        },
      });

      // calculate new filter
      let filters: any;
      if (this.state.filters.map((item) => item.key.value).indexOf(filter.key.value) > -1) {
        filters = this.state.filters.map((val) => {
          return val.key.value === filter.key.value ? filter : val;
        });
      } else {
        filters = [...this.state.filters, filter];
      }

      // fetch data
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      const result = await serviceProxy.findClasses(
        undefined,
        this.state.search || '',
        filters.map((val: any) => {
          if (val.key.value === '$and') return { [val.key.value]: `${val.key.value}%${val.value.value}` };
          if (val.key.value === 'createdAt' || val.key.value === 'startTime') return { [val.key.value]: `${val.key.value}%${JSON.stringify(val.value.value)}` };
          return { [val.key.value]: `${val.key.value}|${val.value.value}` };
        }),
        this.state.pageSize || 10,
        this.state.sortBy || 'startTime|desc',
        undefined,
        undefined,
      );

      this.setState({
        filters,
        data: result.data,
        before: result.before,
        after: result.after,
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    } catch (error) {
      message.error(error.message);
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    }
  }

  removeFilter = async (removeFilter: {
    key: {
      label: string; value: string
    };
    value: {
      label: string; value: string
    };
  }) => {
    try {
      this.setState({
        loading: {
          ...this.state.loading,
          table: true,
        },
      });

      // calculate new filter
      const filters = this.state.filters.filter((item) => item.key.value !== removeFilter.key.value);

      // fetch data
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const result = await serviceProxy.findClasses(
        undefined,
        this.state.search || '',
        filters.map((val: any) => {
          if (val.key.value === '$and') return { [val.key.value]: `${val.key.value}%${val.value.value}` };
          if (val.key.value === 'createdAt' || val.key.value === 'startTime') return { [val.key.value]: `${val.key.value}%${JSON.stringify(val.value.value)}` };
          return { [val.key.value]: `${val.key.value}|${val.value.value}` };
        }),
        this.state.pageSize || 10,
        this.state.sortBy || 'startTime|desc',
        undefined,
        undefined,
      );

      this.setState({
        filters,
        data: result.data,
        before: result.before,
        after: result.after,
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    } catch (error) {
      message.error(error.message);
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    }
  }

  render() {
    const filterTree = [
      {
        label: translate('lang:course'),
        value: 'courseId',
        children: this.state.courses.map((course: any) => ({
          label: course.name,
          value: course._id,
        })),
      },
      {
        label: translate('lang:startTime'),
        value: 'startTime',
        isDateRange: true,
        children: [
          {
            label: translate('lang:last1month'),
            value: JSON.stringify({
              $gte: moment().subtract(30, 'd').startOf('day').valueOf(),
            }),
          },
        ],
      },
    ];

    return (
      <div>
        <Row>
          <Col span={12}><h2 style={{ marginBottom: 24 }}>{translate('lang:allClassesManagement')}</h2></Col>
          <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type='primary' onClick={this.synchronize}>{translate('lang:synchronizeClass')}</Button>
          </Col>
        </Row>
        <BorderWrapper>
          <Main
            data={this.state.data}
            loading={this.state.loading.table}
            handleSearch={this.handleSearch}
            filterTree={filterTree}
            addFilter={this.addFilter}
            filters={this.state.filters}
            search={this.state.search}
            removeFilter={this.removeFilter}
            sortBy={this.state.sortBy}
          ></Main>
          {this.state.after || this.state.before
            ? <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination before={this.state.before} after={this.state.after} loadPreviousPage={() => { this.loadOtherPage(false); }} loadNextPage={() => { this.loadOtherPage(true); }} />
            </div> : null}
        </BorderWrapper>
      </div>
    );
  }
}, [PERMISSIONS.CLASS.VIEW], true, 'admin');
