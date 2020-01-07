import React from 'react';
import './CourseScreen.less';
import { Authorize, BorderWrapper, Pagination } from '@client/components';
import { message, Row, Col, Button } from 'antd';
import { Main } from './Main';
import { PERMISSIONS } from '@common/permissions';
import firebase from 'firebase/app';
import { getServiceProxy } from '@client/services';
import { translate } from '@client/i18n';

interface State {
  search: string;
  data: any;
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

export const CourseScreen = Authorize(class extends React.Component<Props, State> {
  state: State = {
    search: '',
    data: [],
    before: undefined,
    after: undefined,
    sortBy: 'order|asc',
    pageSize: 10,
    loading: {
      table: false,
    },
  };

  async componentDidMount() {
    this.handleSearch({ search: '' });
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
      const result = await serviceProxy.findProductCourse(
        undefined,
        params.search || '',
        undefined,
        this.state.pageSize,
        params.sortBy || this.state.sortBy,
        undefined,
        undefined,
      ) as any;
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
      const result = await serviceProxy.findProductCourse(
        undefined,
        this.state.search,
        undefined,
        this.state.pageSize,
        this.state.sortBy,
        next ? undefined : this.state.before,
        next ? this.state.after : undefined,
      ) as any;
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
      await serviceProxy.synchronizeCourse();
      message.success(translate('lang:synchronizeSuccess'), 2);
      window.location.reload();
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  }

  render() {
    return (
      <div>
        <Row>
          <Col xs={12}>
            <h2 style={{ marginBottom: 24 }}>{translate('lang:allCoursesManagement')}</h2>
          </Col>
          <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type='primary' onClick={this.synchronize}>{translate('lang:synchronizeCourse')}</Button>
          </Col>
        </Row>
        <BorderWrapper>
          <Main
            data={this.state.data}
            loading={this.state.loading.table}
            handleSearch={this.handleSearch}
          ></Main>
          {this.state.before || this.state.after
            ? <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination before={this.state.before} after={this.state.after} loadPreviousPage={() => { this.loadOtherPage(false); }}
                loadNextPage={() => { this.loadOtherPage(true); }} />
            </div>
            : null}
        </BorderWrapper>
      </div>
    );
  }
}, [PERMISSIONS.PRODUCT_COURSES.VIEW], true, 'admin');
